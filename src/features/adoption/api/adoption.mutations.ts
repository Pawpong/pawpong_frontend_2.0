'use client'

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import type {
  AdoptionFavoriteResponse,
  AdoptionPetCard,
  CreateAdoptionApplicationRequest,
  PaginationInfo,
  PaginationResponse,
  PetStatus,
} from '@/shared/types'
import {
  addAdoptionFavorite,
  removeAdoptionFavorite,
  createAdoptionApplication,
} from './adoption.api'

/** 관심 캐시 패치에 필요한 공통 필드 — 목록 카드와 상세가 함께 가진다(AdoptionPetDetail extends AdoptionPetCard) */
interface FavoritablePet {
  petId: string
  isFavorited: boolean
  favoriteCount: number
}

const isFavoritablePet = (value: unknown): value is FavoritablePet =>
  typeof value === 'object' &&
  value !== null &&
  'petId' in value &&
  'isFavorited' in value &&
  'favoriteCount' in value

/**
 * adoption 캐시 안의 특정 펫만 갈아끼운다.
 * 캐시에 들어있는 형태는 세 가지뿐이다 — 무한 목록(InfiniteData<PaginationResponse>), 배열(popular), 단일 상세.
 */
const patchAdoptionCache = (
  data: unknown,
  petId: string,
  patch: (pet: FavoritablePet) => FavoritablePet,
): unknown => {
  const applyToPet = (value: unknown) =>
    isFavoritablePet(value) && value.petId === petId ? patch(value) : value

  if (Array.isArray(data)) return data.map(applyToPet)
  if (typeof data !== 'object' || data === null) return data

  if ('pages' in data && Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page: unknown) =>
        typeof page === 'object' && page !== null && 'items' in page && Array.isArray(page.items)
          ? { ...page, items: page.items.map(applyToPet) }
          : page,
      ),
    }
  }
  return applyToPet(data)
}

type FavoritePages = InfiniteData<PaginationResponse<AdoptionPetCard>, number>

interface FavoriteCacheTarget {
  queryKey: QueryKey
  status?: PetStatus
  page: number
  pageSize: number
  hasNextPage: boolean
}

const isPetStatus = (value: unknown): value is PetStatus =>
  value === 'available' || value === 'reserved' || value === 'adopted'

const getFavoriteStatus = (queryKey: QueryKey): PetStatus | undefined => {
  const status = queryKey[2]
  return isPetStatus(status) ? status : undefined
}

const containsFavorite = (data: FavoritePages, petId: string) =>
  data.pages.some((page) => page.items.some((item) => item.petId === petId))

/** 관심목록에서 항목과 총 개수만 낙관적으로 제거한다. 나머지 pagination은 서버 응답으로 확정한다. */
const removeFromFavoritePages = (data: FavoritePages | undefined, petId: string) => {
  if (!data || !containsFavorite(data, petId)) return data

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.petId !== petId),
      pagination: {
        ...page.pagination,
        totalItems: Math.max(0, page.pagination.totalItems - 1),
      },
    })),
  }
}

const syncFavoritePagination = (
  data: FavoritePages,
  pagination: Pick<PaginationInfo, 'totalItems' | 'totalPages'>,
): FavoritePages => ({
  ...data,
  pages: data.pages.map((page) => ({
    ...page,
    pagination: {
      ...page.pagination,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasNextPage: page.pagination.currentPage < pagination.totalPages,
    },
  })),
})

/** 부분 로드 목록의 마지막 페이지 한 건만 겹쳐 받아, 삭제로 앞으로 당겨진 항목을 보충한다. */
const mergeFavoriteBackfill = (
  data: FavoritePages,
  refreshedPage: PaginationResponse<AdoptionPetCard>,
  removedPetId: string,
): FavoritePages => {
  const knownIds = new Set(data.pages.flatMap((page) => page.items.map((item) => item.petId)))
  const additions = refreshedPage.items.filter(
    (item) => item.petId !== removedPetId && !knownIds.has(item.petId),
  )
  const refreshedIndex = data.pages.findIndex(
    (page) => page.pagination.currentPage === refreshedPage.pagination.currentPage,
  )
  const targetIndex = refreshedIndex >= 0 ? refreshedIndex : data.pages.length - 1

  return syncFavoritePagination(
    {
      ...data,
      pages: data.pages.map((page, index) =>
        index === targetIndex ? { ...page, items: [...page.items, ...additions] } : page,
      ),
    },
    refreshedPage.pagination,
  )
}

interface ToggleFavoriteVariables {
  petId: string
  nextFavorited: boolean
}

/**
 * 관심 등록/해제 mutation — 캐시를 직접 패치해 refetch 없이 즉시 반영한다.
 *
 * 예전에는 onSuccess에서 adoptionQueries.all()을 통째로 invalidate 했는데,
 * 하트 한 번에 list/popular/breederPets/detail이 전부 재요청됐다.
 * 지금은 onMutate에서 해당 펫만 갈아끼우고, onSettled는 refetchType 'none'으로
 * "다음 마운트 때 최신화" 표시만 남긴다. 관심목록이 부분 로드된 경우에만 삭제로
 * 앞으로 당겨진 항목을 채우기 위해 마지막 로드 페이지 한 건을 추가 조회한다.
 *
 * 등록/해제를 분리하지 않고 nextFavorited를 variables로 받는다.
 * 카드마다 호출되는 훅이라 mutation을 두 개 만들면 목록 하나에 observer가 2배로 붙는다.
 */
const useToggleFavoriteMutation = () => {
  const qc = useQueryClient()
  const scope = { queryKey: adoptionQueries.all() }
  const favoritesScope = { queryKey: adoptionQueries.myFavoritesAll() }

  return useMutation({
    mutationFn: ({ petId, nextFavorited }: ToggleFavoriteVariables) =>
      nextFavorited ? addAdoptionFavorite(petId) : removeAdoptionFavorite(petId),
    onMutate: async ({ petId, nextFavorited }) => {
      // 진행 중인 refetch가 낙관적 패치를 덮어쓰지 않도록 먼저 취소.
      // 단 최초 로딩(데이터 없음)까지 끊으면 재요청 없이 pending으로 남으므로 제외한다.
      await qc.cancelQueries({
        ...scope,
        predicate: (query) => query.state.data !== undefined,
      })
      const snapshot = qc.getQueriesData(scope)
      const favoriteTargets = qc
        .getQueriesData<FavoritePages>({ ...favoritesScope, type: 'active' })
        .flatMap<FavoriteCacheTarget>(([queryKey, data]) => {
          if (!data || !containsFavorite(data, petId)) return []

          const lastPage = data.pages.at(-1)
          if (!lastPage) return []

          return [
            {
              queryKey,
              status: getFavoriteStatus(queryKey),
              page: lastPage.pagination.currentPage,
              pageSize: lastPage.pagination.pageSize,
              hasNextPage: lastPage.pagination.hasNextPage,
            },
          ]
        })
      qc.setQueriesData(scope, (data) =>
        patchAdoptionCache(data, petId, (pet) => ({
          ...pet,
          isFavorited: nextFavorited,
          // 멱등 API라 이미 같은 상태면 카운트를 건드리지 않는다
          favoriteCount:
            pet.isFavorited === nextFavorited
              ? pet.favoriteCount
              : pet.favoriteCount + (nextFavorited ? 1 : -1),
        })),
      )
      if (!nextFavorited) {
        qc.setQueriesData<FavoritePages>(favoritesScope, (data) =>
          removeFromFavoritePages(data, petId),
        )
      }
      return { snapshot, favoriteTargets }
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data))
    },
    // 서버가 확정 카운트를 돌려주므로 낙관적 ±1을 실제 값으로 교정
    onSuccess: async (result: AdoptionFavoriteResponse, { nextFavorited }, context) => {
      qc.setQueriesData(scope, (data) =>
        patchAdoptionCache(data, result.petId, (pet) => ({
          ...pet,
          favoriteCount: result.favoriteCount,
        })),
      )

      if (nextFavorited) return

      await Promise.all(
        context.favoriteTargets.map(async (target) => {
          if (!target.hasNextPage) {
            qc.setQueryData<FavoritePages>(target.queryKey, (data) => {
              if (!data) return data

              const optimisticTotalItems = data.pages[0]?.pagination.totalItems ?? 0
              const totalPages =
                target.pageSize > 0 ? Math.ceil(optimisticTotalItems / target.pageSize) : 0

              return syncFavoritePagination(data, {
                totalItems: optimisticTotalItems,
                totalPages,
              })
            })
            return
          }

          try {
            const refreshedPage = await qc.fetchQuery(
              adoptionQueries.favoritesPage(target.status, target.page, target.pageSize),
            )
            qc.setQueryData<FavoritePages>(target.queryKey, (data) =>
              data ? mergeFavoriteBackfill(data, refreshedPage, result.petId) : data,
            )
          } catch {
            // 낙관적 제거는 유지하고, 다음 마운트에서 서버 상태를 다시 확인한다.
          }
        }),
      )
    },
    onSettled: () => qc.invalidateQueries({ ...scope, refetchType: 'none' }),
  })
}

/**
 * 관심(좋아요) 토글 — 캐시가 단일 진실이라 로컬 state가 없다.
 * 낙관적 반영/롤백은 mutation의 캐시 패치가 담당하고, isFavorite은 호출부가 넘긴 쿼리 값이 그대로 흐른다.
 */
export const useToggleAdoptionFavorite = (petId: string, isFavorite: boolean) => {
  const { mutate } = useToggleFavoriteMutation()

  return {
    isFavorite,
    toggleFavorite: () => mutate({ petId, nextFavorited: !isFavorite }),
  }
}

export const useCreateAdoptionApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdoptionApplicationRequest) => createAdoptionApplication(data),
    // 신청은 상태/카운트가 여러 곳에 걸쳐 바뀌므로 관심 토글과 달리 전체 무효화가 맞다
    onSuccess: () => qc.invalidateQueries({ queryKey: adoptionQueries.all() }),
  })
}

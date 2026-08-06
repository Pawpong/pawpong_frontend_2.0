'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import type { AdoptionFavoriteResponse, CreateAdoptionApplicationRequest } from '@/shared/types'
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
 * "다음 마운트 때 최신화" 표시만 남긴다 → 토글당 네트워크 요청은 mutation 1건뿐.
 *
 * 등록/해제를 분리하지 않고 nextFavorited를 variables로 받는다.
 * 카드마다 호출되는 훅이라 mutation을 두 개 만들면 목록 하나에 observer가 2배로 붙는다.
 */
const useToggleFavoriteMutation = () => {
  const qc = useQueryClient()
  const scope = { queryKey: adoptionQueries.all() }

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
      return { snapshot }
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data))
    },
    // 서버가 확정 카운트를 돌려주므로 낙관적 ±1을 실제 값으로 교정
    onSuccess: (result: AdoptionFavoriteResponse) => {
      qc.setQueriesData(scope, (data) =>
        patchAdoptionCache(data, result.petId, (pet) => ({
          ...pet,
          favoriteCount: result.favoriteCount,
        })),
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

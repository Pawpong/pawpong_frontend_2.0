'use client'

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type QueryFilters,
} from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { applicationQueries } from '@/entities/application'
import { breederQueries } from '@/entities/breeder'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import { patchCachedItem } from '@/shared/lib/patchCachedItem'
import {
  updateAdopterProfile,
  deleteAdopterAccount,
  addFavorite,
  removeFavorite,
  createReview,
} from './adopter.api'
import type {
  AdopterProfileUpdateRequest,
  FavoriteAddResponseDto,
  FavoriteBreederCard,
  PaginationResponse,
  ReviewCreateRequest,
  WithdrawReason,
} from '@/shared/types'

export const useUpdateAdopterProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AdopterProfileUpdateRequest) => updateAdopterProfile(data),
    onSuccess: async () => {
      // 닉네임/프로필 이미지는 커뮤니티 게시글·댓글에 작성자 snapshot 으로 복제돼 있어,
      // 프로필 변경 시 커뮤니티 목록(내가 쓴 글/피드/상세)도 갱신되도록 무효화한다.
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
      await Promise.all([
        qc.invalidateQueries({ queryKey: adopterQueries.profile().queryKey }),
        qc.invalidateQueries({ queryKey: profileQueries.me().queryKey }),
      ])
    },
  })
}

export const useDeleteAdopterAccount = () =>
  useMutation({
    mutationFn: (data: { reason: WithdrawReason; otherReason?: string }) =>
      deleteAdopterAccount(data),
  })

// 브리더 화면은 이미 패치한 상태를 유지하고, 다음 진입 때 서버와 다시 맞춘다.
// 별 하나를 누를 때 탐색·인기·프로필을 모두 다시 조회하지 않는다.
const invalidateFavoriteCaches = (qc: QueryClient) =>
  Promise.all([
    // 공개 프로필의 400/404는 브리더 홈 판정에 쓰인다. 재조회하면 홈이 다시 마운트된다.
    qc.invalidateQueries({ queryKey: adopterQueries.profile().queryKey, exact: true }),
    qc.invalidateQueries({ queryKey: [...profileQueries.all(), 'favoriteBreeders'] }),
    qc.invalidateQueries({ queryKey: breederQueries.all(), refetchType: 'none' }),
  ])

interface FavoritableBreeder {
  breederId: string
  isFavorited: boolean
  favoriteCount?: number
}

const isFavoritableBreeder = (value: unknown): value is FavoritableBreeder =>
  typeof value === 'object' &&
  value !== null &&
  'breederId' in value &&
  typeof value.breederId === 'string' &&
  'isFavorited' in value &&
  typeof value.isFavorited === 'boolean'

const patchBreederFavorite = (data: unknown, breederId: string, isFavorited: boolean) =>
  patchCachedItem(data, (value) => {
    if (!isFavoritableBreeder(value) || value.breederId !== breederId) return value
    if (value.isFavorited === isFavorited) return value
    return {
      ...value,
      isFavorited,
      ...(typeof value.favoriteCount === 'number' && {
        favoriteCount: Math.max(0, value.favoriteCount + (isFavorited ? 1 : -1)),
      }),
    }
  })

/**
 * 즐겨찾는 브리더 목록 캐시에서 해당 카드를 즉시 제거한다.
 * 삭제 성공 후 적용하므로 실패한 요청 때문에 카드가 사라졌다 다시 나타나지 않는다.
 */
const dropFromFavoriteList = (qc: QueryClient, breederId: string) =>
  qc.setQueriesData<InfiniteData<PaginationResponse<FavoriteBreederCard>>>(
    { queryKey: [...profileQueries.all(), 'favoriteBreeders'] },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((breeder) => breeder.breederId !== breederId),
        })),
      },
  )

const favoriteMutationKey = ['breeder-favorite'] as const
// 같은 브리더가 모바일/태블릿/다른 카드에 동시에 렌더되어도 하나의 요청만 처리한다.
const favoriteRequests = new WeakMap<QueryClient, Map<string, Promise<FavoriteAddResponseDto>>>()
const breederFavoriteScope: QueryFilters = {
  queryKey: breederQueries.all(),
  predicate: (query) =>
    ['public-profile', 'explore', 'popular'].includes(String(query.queryKey[1])),
}
const favoriteScopes: QueryFilters[] = [
  breederFavoriteScope,
  { queryKey: [...profileQueries.all(), 'favoriteBreeders'] },
]

const useFavoriteMutation = (nextFavorited: boolean) => {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationKey: favoriteMutationKey,
    mutationFn: (breederId: string) =>
      nextFavorited ? addFavorite(breederId) : removeFavorite(breederId),
    onMutate: async (breederId) => {
      await Promise.all(
        favoriteScopes.map((scope) =>
          qc.cancelQueries({
            ...scope,
            predicate: (query) =>
              query.state.data !== undefined && (!scope.predicate || scope.predicate(query)),
          }),
        ),
      )
      const snapshot = favoriteScopes.flatMap((scope) => qc.getQueriesData(scope))
      favoriteScopes.forEach((scope) =>
        qc.setQueriesData(scope, (data) => patchBreederFavorite(data, breederId, nextFavorited)),
      )
      return { snapshot }
    },
    onError: (_error, breederId, context) => {
      context?.snapshot.forEach(([queryKey, previous]) => {
        // 다른 별의 동시 변경까지 오래된 목록 전체로 덮어쓰지 않는다.
        patchCachedItem(previous, (value) => {
          if (isFavoritableBreeder(value) && value.breederId === breederId) {
            qc.setQueryData(queryKey, (data: unknown) =>
              patchBreederFavorite(data, breederId, value.isFavorited),
            )
          }
          return value
        })
      })
    },
    onSuccess: async (_result, breederId) => {
      // 저장 중 새로 진입한 화면도 확정 상태로 맞추고, 이전 응답이 덮어쓰지 않게 한다.
      await Promise.all(favoriteScopes.map((scope) => qc.cancelQueries(scope)))
      favoriteScopes.forEach((scope) =>
        qc.setQueriesData(scope, (data) => patchBreederFavorite(data, breederId, nextFavorited)),
      )
      if (!nextFavorited) dropFromFavoriteList(qc, breederId)
      // 아직 데이터가 없는 새 화면의 최초 조회만 재개한다. 보이는 기존 목록은 유지한다.
      await qc.refetchQueries({
        ...breederFavoriteScope,
        type: 'active',
        predicate: (query) =>
          query.state.data === undefined && !!breederFavoriteScope.predicate?.(query),
      })
    },
    onSettled: () => {
      // 여러 별을 연속으로 누르면 마지막 요청 이후에만 즐겨찾기 목록을 새로 받는다.
      if (qc.isMutating({ mutationKey: favoriteMutationKey }) === 1) {
        return invalidateFavoriteCaches(qc)
      }
    },
  })

  const mutateAsync: typeof mutation.mutateAsync = (breederId, options) => {
    let requests = favoriteRequests.get(qc)
    if (!requests) {
      requests = new Map()
      favoriteRequests.set(qc, requests)
    }
    const pending = requests.get(breederId)
    if (pending) return pending
    const request = mutation.mutateAsync(breederId, options).finally(() => {
      requests.delete(breederId)
    })
    requests.set(breederId, request)
    return request
  }

  return {
    ...mutation,
    mutateAsync,
    mutate: ((breederId, options) => {
      void mutateAsync(breederId, options).catch(() => undefined)
    }) as typeof mutation.mutate,
  }
}

export const useAddFavorite = () => useFavoriteMutation(true)
export const useRemoveFavorite = () => useFavoriteMutation(false)

export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewCreateRequest) => createReview(data),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: [...adopterQueries.all(), 'reviews'] }),
        qc.invalidateQueries({ queryKey: applicationQueries.all() }),
      ])
    },
  })
}

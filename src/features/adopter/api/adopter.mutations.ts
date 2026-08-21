'use client'

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import {
  updateAdopterProfile,
  deleteAdopterAccount,
  addFavorite,
  removeFavorite,
  createReview,
} from './adopter.api'
import type {
  AdopterProfileUpdateRequest,
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

/**
 * 즐겨찾기 토글이 건드리는 캐시.
 * isFavorited 를 들고 있는 브리더 쿼리가 공개 프로필·탐색 목록 여럿이고 staleTime 도
 * 길어(VERY_LONG) breeder 루트째 지워야 다시 들어왔을 때 별 상태가 어긋나지 않는다.
 */
const invalidateFavoriteCaches = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: adopterQueries.all() }),
    qc.invalidateQueries({ queryKey: profileQueries.favoriteBreeders().queryKey }),
    qc.invalidateQueries({ queryKey: breederQueries.all() }),
  ])

export const useAddFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => addFavorite(breederId),
    onSuccess: () => {
      void invalidateFavoriteCaches(qc)
    },
  })
}

/**
 * 즐겨찾는 브리더 목록 캐시에서 해당 카드를 즉시 제거한다.
 * 목록은 등록된 브리더만 반환해(isFavorited 항상 true) 재조회 전까지 카드가 채워진 별로 남는다.
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

export const useRemoveFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => removeFavorite(breederId),
    onMutate: (breederId) => {
      dropFromFavoriteList(qc, breederId)
    },
    // ponytail: 롤백 스냅샷 대신 재조회로 되돌린다 (실패는 드물고 서버가 정답)
    onError: () => {
      void qc.invalidateQueries({ queryKey: profileQueries.favoriteBreeders().queryKey })
    },
    onSuccess: () => {
      void invalidateFavoriteCaches(qc)
    },
  })
}

export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewCreateRequest) => createReview(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adopterQueries.reviews().queryKey })
    },
  })
}

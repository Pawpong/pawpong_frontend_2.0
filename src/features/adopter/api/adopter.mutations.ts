'use client'

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
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
 * 브리더 공개 프로필이 isFavorited 를 들고 있고 staleTime 이 길어(VERY_LONG) 함께 지워야
 * 홈으로 돌아왔을 때 별 상태가 어긋나지 않는다.
 */
const invalidateFavoriteCaches = (qc: QueryClient, breederId: string) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: adopterQueries.all() }),
    qc.invalidateQueries({ queryKey: profileQueries.favoriteBreeders().queryKey }),
    qc.invalidateQueries({ queryKey: breederQueries.publicProfile(breederId).queryKey }),
  ])

export const useAddFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => addFavorite(breederId),
    onSuccess: (_, breederId) => {
      void invalidateFavoriteCaches(qc, breederId)
    },
  })
}

export const useRemoveFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => removeFavorite(breederId),
    onSuccess: (_, breederId) => {
      void invalidateFavoriteCaches(qc, breederId)
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

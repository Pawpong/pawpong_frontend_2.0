'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { communityQueries } from '@/entities/community'
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adopterQueries.profile().queryKey })
      // 닉네임/프로필 이미지는 커뮤니티 게시글·댓글에 작성자 snapshot 으로 복제돼 있어,
      // 프로필 변경 시 커뮤니티 목록(내가 쓴 글/피드/상세)도 갱신되도록 무효화한다.
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useDeleteAdopterAccount = () =>
  useMutation({
    mutationFn: (data: { reason: WithdrawReason; otherReason?: string }) =>
      deleteAdopterAccount(data),
  })

export const useAddFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => addFavorite(breederId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adopterQueries.all() })
    },
  })
}

export const useRemoveFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (breederId: string) => removeFavorite(breederId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adopterQueries.all() })
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

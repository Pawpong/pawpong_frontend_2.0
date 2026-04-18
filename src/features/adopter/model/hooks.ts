'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter/Queries'
import {
  updateAdopterProfile,
  deleteAdopterAccount,
  addFavorite,
  removeFavorite,
  createReview,
} from '@/entities/adopter/Api'
import type { AdopterProfileDto, ReviewCreateRequest, WithdrawReason } from '@/shared/types'

export const useUpdateAdopterProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdopterProfileDto>) => updateAdopterProfile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adopterQueries.profile().queryKey })
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

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import type { CreateAdoptionApplicationRequest } from '@/shared/types'
import {
  addAdoptionFavorite,
  removeAdoptionFavorite,
  createAdoptionApplication,
} from './adoption.api'

export const useAddAdoptionFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => addAdoptionFavorite(petId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adoptionQueries.all() })
    },
  })
}

export const useRemoveAdoptionFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => removeAdoptionFavorite(petId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adoptionQueries.all() })
    },
  })
}

export const useCreateAdoptionApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdoptionApplicationRequest) => createAdoptionApplication(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adoptionQueries.all() })
    },
  })
}

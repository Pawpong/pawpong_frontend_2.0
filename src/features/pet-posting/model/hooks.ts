'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { petPostingQueries } from '@/entities/petPosting/Queries'
import {
  createPetPosting,
  updatePetPosting,
  deletePetPosting,
} from '@/entities/petPosting/Api'
import type { CreatePetPostingRequest, UpdatePetPostingRequest } from '@/shared/types'

export const useCreatePetPosting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePetPostingRequest) => createPetPosting(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: petPostingQueries.all() })
    },
  })
}

export const useUpdatePetPosting = (petId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePetPostingRequest) => updatePetPosting(petId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: petPostingQueries.all() })
    },
  })
}

export const useDeletePetPosting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => deletePetPosting(petId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: petPostingQueries.all() })
    },
  })
}

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { petPostingQueries } from '@/entities/pet-posting'
import { adoptionQueries } from '@/entities/adoption'
import type { CreatePetPostingRequest, UpdatePetPostingRequest } from '@/shared/types'
import { createPetPosting, updatePetPosting, deletePetPosting } from './pet-posting.api'

// 분양글 변경은 내 분양글 목록(petPosting)과 공개 탐색/인기/상세(adoption) 캐시를 함께 무효화
const invalidatePostingCaches = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: petPostingQueries.all() })
  void qc.invalidateQueries({ queryKey: adoptionQueries.all() })
}

export const useCreatePetPosting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePetPostingRequest) => createPetPosting(data),
    onSuccess: () => invalidatePostingCaches(qc),
  })
}

export const useUpdatePetPosting = (petId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePetPostingRequest) => updatePetPosting(petId, data),
    onSuccess: () => invalidatePostingCaches(qc),
  })
}

export const useDeletePetPosting = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => deletePetPosting(petId),
    onSuccess: () => invalidatePostingCaches(qc),
  })
}

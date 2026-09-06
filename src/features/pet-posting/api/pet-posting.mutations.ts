'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { petPostingQueries } from '@/entities/pet-posting'
import { adoptionQueries } from '@/entities/adoption'
import type {
  CreatePetPostingRequest,
  UpdatePetPostingRequest,
  SavePetPostingDraftRequest,
} from '@/shared/types'
import {
  createPetPosting,
  updatePetPosting,
  deletePetPosting,
  savePetPostingDraft,
  overwritePetPostingDraft,
  deletePetPostingDraft,
} from './pet-posting.api'

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

// 임시저장은 발행 목록을 건드리지 않으므로 임시저장 캐시만 무효화한다
const invalidateDraftCaches = (qc: ReturnType<typeof useQueryClient>) => {
  void qc.invalidateQueries({ queryKey: [...petPostingQueries.all(), 'drafts'] })
}

export const useSavePetPostingDraft = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SavePetPostingDraftRequest) => savePetPostingDraft(data),
    onSuccess: () => invalidateDraftCaches(qc),
  })
}

export const useOverwritePetPostingDraft = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, data }: { draftId: string; data: SavePetPostingDraftRequest }) =>
      overwritePetPostingDraft(draftId, data),
    onSuccess: () => invalidateDraftCaches(qc),
  })
}

export const useDeletePetPostingDraft = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draftId: string) => deletePetPostingDraft(draftId),
    onSuccess: () => invalidateDraftCaches(qc),
  })
}

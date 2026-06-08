'use client'

import { useState } from 'react'
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

/**
 * 관심(좋아요) 토글 — 낙관적 UI 상태 + add/remove mutation 연결.
 * 카드가 mock 데이터라 실제 API는 404일 수 있으므로 낙관적 상태를 유지(롤백 없음)한다.
 * 백엔드 연동 후에는 onError 롤백을 추가한다.
 */
export const useToggleAdoptionFavorite = (petId: string, initialFavorite: boolean) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const addFavorite = useAddAdoptionFavorite()
  const removeFavorite = useRemoveAdoptionFavorite()

  const toggleFavorite = () => {
    const next = !isFavorite
    setIsFavorite(next)
    if (next) addFavorite.mutate(petId)
    else removeFavorite.mutate(petId)
  }

  return { isFavorite, toggleFavorite }
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

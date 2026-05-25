'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption/Queries'
import { addAdoptionFavorite, removeAdoptionFavorite } from '@/entities/adoption/Api'

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

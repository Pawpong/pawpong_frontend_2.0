'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { carePlaceQueries, type CarePlace } from '@/entities/care-place'
import { toCarePlaceFavoriteSnapshot } from '../lib/care-place-favorite'
import { addCarePlaceFavorite, removeCarePlaceFavorite } from './care-place-favorite.api'

interface ToggleCarePlaceFavorite {
  place: CarePlace
  /** 누르기 직전 상태 — true 면 취소 요청 */
  favorited: boolean
}

/** 즐겨찾기 토글 — 버튼이 바로 바뀌도록 목록 캐시를 먼저 고치고, 실패하면 되돌린다 */
export const useToggleCarePlaceFavorite = () => {
  const queryClient = useQueryClient()
  const { queryKey } = carePlaceQueries.favorites()
  return useMutation({
    mutationFn: ({ place, favorited }: ToggleCarePlaceFavorite) =>
      favorited ? removeCarePlaceFavorite(place.id) : addCarePlaceFavorite(place),
    onMutate: async ({ place, favorited }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (list = []) =>
        favorited
          ? list.filter((favorite) => favorite.id !== place.id)
          : [
              { ...toCarePlaceFavoriteSnapshot(place), favoritedAt: new Date().toISOString() },
              ...list.filter((favorite) => favorite.id !== place.id),
            ],
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}

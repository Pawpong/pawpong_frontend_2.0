'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { useAiPixelTransform } from './useAiPixelTransform'

/**
 * AI 도트 필터 선택 + 변환 상태.
 *
 * 필터는 관리자가 정한 정렬 순서의 첫 번째(기본: 포퐁 도트 초상화)를 미리 골라 둔다.
 * 콘테스트 없이 쓰므로 생성 횟수는 서버가 하루 3회로 센다.
 */
export const useAiPixelFilter = () => {
  const filtersQuery = useQuery(aiImageQueries.filters())
  const transform = useAiPixelTransform()
  const [pickedFilterId, setPickedFilterId] = useState<string | null>(null)

  const filters = filtersQuery.data ?? []
  const selectedFilterId =
    pickedFilterId && filters.some((filter) => filter.filterId === pickedFilterId)
      ? pickedFilterId
      : (filters[0]?.filterId ?? null)

  const { transform: runTransform } = transform
  const start = useCallback(
    async (file: File) => {
      if (!selectedFilterId) return null
      return runTransform({ file, filterId: selectedFilterId })
    },
    [runTransform, selectedFilterId],
  )

  return {
    filters,
    isAvailable: filters.length > 0,
    selectedFilterId,
    selectFilter: setPickedFilterId,
    phase: transform.phase,
    error: transform.error,
    isWorking: transform.isWorking,
    result: transform.phase === 'done' ? transform.result : null,
    start,
    reset: transform.reset,
  }
}

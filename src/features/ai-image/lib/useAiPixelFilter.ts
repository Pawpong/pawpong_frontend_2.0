'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { contestQueries } from '@/entities/contest'
import { useAiPixelTransform } from './useAiPixelTransform'

/**
 * 콘테스트 참여용 AI 도트 필터 상태.
 *
 * - 필터는 관리자가 정한 정렬 순서의 첫 번째(기본: 포퐁 도트 초상화)를 미리 골라 둔다.
 * - 변환이 끝나면 도트 버전을 기본 선택한다 — 포퐁 콘테스트의 기본 톤이 도트 그림이다.
 * - 생성 횟수는 콘테스트 단위로 세므로 진행 중 콘테스트 ID 를 함께 보낸다.
 */
export const useAiPixelFilter = () => {
  const filtersQuery = useQuery(aiImageQueries.filters())
  const contestQuery = useQuery(contestQueries.current())
  const transform = useAiPixelTransform()
  const [pickedFilterId, setPickedFilterId] = useState<string | null>(null)
  // 결과가 나오면 도트 버전이 기본. 사용자가 원본으로 되돌릴 수 있다
  const [choice, setChoice] = useState<'ai' | 'original'>('ai')

  const filters = filtersQuery.data ?? []
  const selectedFilterId =
    pickedFilterId && filters.some((filter) => filter.filterId === pickedFilterId)
      ? pickedFilterId
      : (filters[0]?.filterId ?? null)

  const { transform: runTransform, reset: resetTransform } = transform
  const contestId = contestQuery.data?.contest.id

  const start = useCallback(
    async (file: File) => {
      if (!selectedFilterId) return
      setChoice('ai')
      await runTransform({ file, filterId: selectedFilterId, contestId })
    },
    [runTransform, selectedFilterId, contestId],
  )

  const reset = useCallback(() => {
    resetTransform()
    setChoice('ai')
  }, [resetTransform])

  const aiResult = transform.phase === 'done' ? transform.result : null

  return {
    filters,
    isAvailable: filters.length > 0,
    selectedFilterId,
    selectFilter: setPickedFilterId,
    phase: transform.phase,
    error: transform.error,
    isWorking: transform.isWorking,
    aiResult,
    useAiVersion: !!aiResult && choice === 'ai',
    setUseAiVersion: (useAi: boolean) => setChoice(useAi ? 'ai' : 'original'),
    start,
    reset,
  }
}

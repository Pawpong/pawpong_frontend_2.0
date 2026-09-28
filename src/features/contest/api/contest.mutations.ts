'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contestQueries } from '@/entities/contest'
import type { SubmitContestEntryRequest } from '@/shared/types'
import { submitContestEntry } from './contest.api'

export const useSubmitContestEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitContestEntryRequest) => submitContestEntry(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: contestQueries.all() })
    },
  })
}

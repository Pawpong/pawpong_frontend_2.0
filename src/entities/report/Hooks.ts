'use client'

import { useMutation } from '@tanstack/react-query'
import { reportReview, reportBreeder } from './Api'
import type { ReportReviewPayload, ReportBreederPayload } from '@/shared/types'

export const useReportReview = () =>
  useMutation({ mutationFn: (payload: ReportReviewPayload) => reportReview(payload) })

export const useReportBreeder = () =>
  useMutation({ mutationFn: (payload: ReportBreederPayload) => reportBreeder(payload) })

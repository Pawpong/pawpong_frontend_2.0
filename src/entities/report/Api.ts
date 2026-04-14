import { apiClient, unwrap } from '@/shared/api'
import type { ReportReviewPayload, ReportBreederPayload } from '@/shared/types'

/** 후기 신고 */
export const reportReview = (payload: ReportReviewPayload) =>
  apiClient
    .post<{
      success: boolean
      data: { reportId: string; message: string }
      message?: string
    }>('/api/adopter/report/review', payload)
    .then(unwrap)

/** 브리더 신고 */
export const reportBreeder = (payload: ReportBreederPayload) =>
  apiClient
    .post<{
      success: boolean
      data: { reportId: string; message: string }
      message?: string
    }>('/api/adopter/report', { type: 'breeder', ...payload })
    .then(unwrap)

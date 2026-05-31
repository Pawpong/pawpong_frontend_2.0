import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ReportReviewPayload, ReportBreederPayload } from '@/shared/types'

export const reportReview = (payload: ReportReviewPayload) =>
  apiClient
    .post<{
      success: boolean
      data: { reportId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/report/review`, payload)
    .then(unwrap)

export const reportBreeder = (payload: ReportBreederPayload) =>
  apiClient
    .post<{
      success: boolean
      data: { reportId: string; message: string }
      message?: string
    }>(`${API_VERSION}/adopter/report`, { type: 'breeder', ...payload })
    .then(unwrap)

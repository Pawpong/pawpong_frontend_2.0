import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { AllFilterOptions } from '@/shared/types'

/** 전체 필터 옵션 조회 */
export const getAllFilterOptions = () =>
  apiClient
    .get<{ success: boolean; data: AllFilterOptions; message?: string }>(
      `${API_VERSION}/filter-options`,
    )
    .then(unwrap)

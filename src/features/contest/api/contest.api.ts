import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  SubmitContestEntryRequest,
  SubmitContestEntryResponse,
} from '@/shared/types'

/** 콘테스트 참여 */
export const submitContestEntry = async (
  data: SubmitContestEntryRequest,
): Promise<SubmitContestEntryResponse> => {
  const response = await apiClient.post<ApiResponseFull<SubmitContestEntryResponse>>(
    `${API_VERSION}/contest/entry`,
    data,
  )
  return unwrap(response, '콘테스트 참여에 실패했습니다.')
}

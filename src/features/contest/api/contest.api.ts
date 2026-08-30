import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type {
  ApiResponseFull,
  ContestVoteResponse,
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

/** 투표하기 */
export const voteContestEntry = async (entryId: string): Promise<ContestVoteResponse> => {
  const response = await apiClient.post<ApiResponseFull<ContestVoteResponse>>(
    `${API_VERSION}/contest/vote/${entryId}`,
  )
  return unwrap(response, '투표에 실패했습니다.')
}

/** 투표 취소 */
export const cancelContestVote = async (entryId: string): Promise<ContestVoteResponse> => {
  const response = await apiClient.delete<ApiResponseFull<ContestVoteResponse>>(
    `${API_VERSION}/contest/vote/${entryId}`,
  )
  return unwrap(response, '투표 취소에 실패했습니다.')
}

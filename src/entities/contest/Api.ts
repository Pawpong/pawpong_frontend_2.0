import { apiClient, API_VERSION, unwrap, unwrapNullable, unwrapVoid } from '@/shared/api'
import type {
  ApiResponseFull,
  PaginationResponse,
  ContestCurrent,
  ContestEntry,
  ContestPreviousRanking,
  ContestEntriesParams,
  ContestVoteResponse,
  SubmitContestEntryRequest,
  SubmitContestEntryResponse,
  HallOfFameItem,
  HallOfFameParams,
} from '@/shared/types'

/** 현재 콘테스트 조회 */
export const getCurrentContest = async (): Promise<ContestCurrent | null> => {
  const response = await apiClient.get<ApiResponseFull<ContestCurrent | null>>(
    `${API_VERSION}/contest/current`,
  )
  return unwrapNullable(response, '현재 콘테스트 조회에 실패했습니다.')
}

/** 투표 항목 목록 조회 */
export const getContestEntries = async (
  params: ContestEntriesParams = {},
): Promise<PaginationResponse<ContestEntry>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<ContestEntry>>>(
    `${API_VERSION}/contest/entries?${query.toString()}`,
  )
  return unwrap(response, '투표 항목 목록 조회에 실패했습니다.')
}

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

/** 나의 참여 항목 조회 */
export const getMyContestEntry = async (): Promise<ContestEntry | null> => {
  const response = await apiClient.get<ApiResponseFull<ContestEntry | null>>(
    `${API_VERSION}/contest/me/entry`,
  )
  return unwrapNullable(response, '나의 참여 항목 조회에 실패했습니다.')
}

/** 저번 콘테스트 랭킹 */
export const getPreviousRanking = async (): Promise<ContestPreviousRanking | null> => {
  const response = await apiClient.get<ApiResponseFull<ContestPreviousRanking | null>>(
    `${API_VERSION}/contest/previous-ranking`,
  )
  return unwrapNullable(response, '저번 콘테스트 랭킹 조회에 실패했습니다.')
}

/** 명예의 전당 목록 */
export const getHallOfFame = async (
  params: HallOfFameParams = {},
): Promise<PaginationResponse<HallOfFameItem>> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const response = await apiClient.get<ApiResponseFull<PaginationResponse<HallOfFameItem>>>(
    `${API_VERSION}/contest/hall-of-fame?${query.toString()}`,
  )
  return unwrap(response, '명예의 전당 조회에 실패했습니다.')
}

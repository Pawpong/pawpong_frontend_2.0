import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import { mapCommunityPostDetail, type RawCommunityPostDetail } from '@/entities/community'
import type { ApiResponseFull } from '@/shared/types'
import {
  captureCommunityWriteSession,
  communityWriteRequestOptions,
} from '../lib/communityWriteSession'

export async function requestCommunityPostReview(
  postId: string,
  consent: boolean,
  signal?: AbortSignal,
) {
  if (consent !== true) throw new Error('본문과 첨부 사진의 AI 처리에 동의한 뒤 요청해 주세요.')
  const assertCurrent = captureCommunityWriteSession(signal)
  const response = await apiClient.post<ApiResponseFull<RawCommunityPostDetail>>(
    `${API_VERSION}/community/posts/${encodeURIComponent(postId)}/review`,
    { aiReviewConsent: true },
    communityWriteRequestOptions(signal),
  )
  assertCurrent()
  return mapCommunityPostDetail(unwrap(response, '게시글 심사를 확인하지 못했어요.'))
}

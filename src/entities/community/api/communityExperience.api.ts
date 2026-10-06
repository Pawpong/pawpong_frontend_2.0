import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'
import type { CommunityAiAnswer, CommunityExperienceConfig } from '../model/communityExperience'
import { getAccessToken } from '@/shared/api/token'
import { getAuthSessionGeneration } from '@/shared/lib/authSessionLifecycle'
export const communityExperienceConfigOptions = {
  queryKey: ['community', 'experience', 'config'],
  retry: false,
  staleTime: 30_000,
  queryFn: async ({ signal }: { signal: AbortSignal }): Promise<CommunityExperienceConfig> => {
    const response = await fetch('/api/community/experience/config', { signal, cache: 'no-store' })
    if (!response.ok) throw new Error('커뮤니티 기능을 확인하지 못했어요.')
    return response.json()
  },
}
export async function readCommunityAiAnswer(
  postId: string,
  signal?: AbortSignal,
): Promise<CommunityAiAnswer | null> {
  const token = getAccessToken()
  const generation = getAuthSessionGeneration()
  const result = unwrap(
    await apiClient.get<ApiResponseFull<CommunityAiAnswer | null>>(
      `${API_VERSION}/community/posts/${postId}/ai-answer`,
      { signal },
    ),
  )
  if (token !== getAccessToken() || generation !== getAuthSessionGeneration())
    throw new Error('로그인 정보가 변경됐어요.')
  return result
}
export async function requestCommunityAiAnswer(
  postId: string,
  signal?: AbortSignal,
): Promise<CommunityAiAnswer> {
  return unwrap(
    await apiClient.post<ApiResponseFull<CommunityAiAnswer>>(
      `${API_VERSION}/community/posts/${postId}/ai-answer`,
      { consent: true },
      { signal, timeout: 30000 },
    ),
  )
}

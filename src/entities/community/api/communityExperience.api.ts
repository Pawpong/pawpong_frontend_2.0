import {
  apiClient,
  API_VERSION,
  unwrap,
  unwrapNullable,
  withAuthReadSession,
  withAuthWriteSession,
  getAuthReadSession,
  getAccessToken,
  type AuthReadSession,
  type ApiRequestConfig,
} from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'
import type { CommunityAiAnswer, CommunityExperienceConfig } from '../model/communityExperience'
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
  session: AuthReadSession | null = getAuthReadSession(),
): Promise<CommunityAiAnswer | null> {
  const url = `${API_VERSION}/community/posts/${postId}/ai-answer`
  if (session)
    return withAuthReadSession(
      async (config) =>
        unwrapNullable(await apiClient.get<ApiResponseFull<CommunityAiAnswer | null>>(url, config)),
      session,
      signal,
    )
  const generation = getAuthSessionGeneration()
  if (getAccessToken()) throw new Error('로그인 정보를 다시 확인해 주세요.')
  const config: ApiRequestConfig = {
    signal,
    skipAuth: true,
    skipAuthRefresh: true,
  }
  const result = unwrapNullable(
    await apiClient.get<ApiResponseFull<CommunityAiAnswer | null>>(url, config),
  )
  if (getAccessToken() || generation !== getAuthSessionGeneration())
    throw new Error('로그인 정보가 변경됐어요.')
  return result
}
export async function requestCommunityAiAnswer(
  postId: string,
  signal?: AbortSignal,
  session: AuthReadSession | null = getAuthReadSession(),
): Promise<CommunityAiAnswer> {
  return withAuthWriteSession(
    async (config) =>
      unwrap(
        await apiClient.post<ApiResponseFull<CommunityAiAnswer>>(
          `${API_VERSION}/community/posts/${postId}/ai-answer`,
          { consent: true },
          { ...config, timeout: 30000 },
        ),
      ),
    session,
    signal,
  )
}

import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import { getAccessToken } from '@/shared/api/token'
import { isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import type { ApiResponseFull } from '@/shared/types'
import type { ActivityView, ActivityBadgeOwner, PublicActivityBadges } from '../model/types'

export const activityConfigOptions = {
  queryKey: ['gamification', 'config'],
  retry: false,
  throwOnError: false,
  staleTime: 30_000,
  refetchInterval: 60_000,
  queryFn: async ({ signal }: { signal: AbortSignal }): Promise<{ enabled: boolean }> => {
    const response = await fetch('/api/gamification/config', { signal, cache: 'no-store' })
    if (!response.ok) throw new Error('활동 기능 상태를 확인하지 못했어요.')
    return response.json()
  },
}
export async function withActivitySession<T>(
  generation: number,
  request: () => Promise<T>,
): Promise<T> {
  const token = getAccessToken()
  if (!token || !isAuthSessionCurrent(generation))
    throw new Error('로그인 정보를 다시 확인해 주세요.')
  const result = await request()
  if (getAccessToken() !== token || !isAuthSessionCurrent(generation))
    throw new Error('계정이 변경됐어요. 새 계정의 활동을 확인해 주세요.')
  return result
}
export async function getActivity(signal?: AbortSignal): Promise<ActivityView> {
  return unwrap(
    await apiClient.get<ApiResponseFull<ActivityView>>(`${API_VERSION}/gamification/me`, {
      signal,
    }),
  )
}
export async function synchronizeActivity(signal?: AbortSignal): Promise<ActivityView> {
  return unwrap(
    await apiClient.post<ApiResponseFull<ActivityView>>(
      `${API_VERSION}/gamification/me/sync`,
      {},
      { signal, timeout: 30000 },
    ),
  )
}
export async function displayActivityBadges(
  keys: string[],
  signal?: AbortSignal,
): Promise<ActivityView> {
  return unwrap(
    await apiClient.patch<ApiResponseFull<ActivityView>>(
      `${API_VERSION}/gamification/me/display-badges`,
      { keys },
      { signal },
    ),
  )
}
export async function getPublicActivityBadges(
  owners: ActivityBadgeOwner[],
  signal?: AbortSignal,
): Promise<PublicActivityBadges[]> {
  const publicRequest: ApiRequestConfig = { skipAuth: true, skipAuthRefresh: true }
  const unique = [
    ...new Map(owners.map((owner) => [`${owner.role}:${owner.ownerId}`, owner])).values(),
  ]
  const result: PublicActivityBadges[] = []
  for (let offset = 0; offset < unique.length; offset += 50) {
    const value = unique
      .slice(offset, offset + 50)
      .map((owner) => `${owner.role}:${owner.ownerId}`)
      .join(',')
    result.push(
      ...unwrap(
        await apiClient.get<ApiResponseFull<PublicActivityBadges[]>>(
          `${API_VERSION}/gamification/badges`,
          { params: { owners: value }, signal, ...publicRequest },
        ),
      ),
    )
  }
  return result
}

import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import { ApiError } from '@/shared/api/unwrap'
import { notifyAuthStateChanged } from '@/shared/lib/authStateEvents'
import { refreshAuthSession } from '@/shared/lib/authSessionRecovery'
import type { ApiResponseFull } from '@/shared/types'
import type { ActivityView, ActivityBadgeOwner, PublicActivityBadges } from '../model/types'
import { isActivitySessionCurrent, type ActivitySession } from '../model/session'

export const activityConfigOptions = {
  queryKey: ['gamification', 'config'],
  retry: false,
  throwOnError: false,
  staleTime: 30_000,
  refetchInterval: 60_000,
  queryFn: async ({
    signal,
  }: {
    signal: AbortSignal
  }): Promise<{ enabled: boolean; breederLevelPublic: boolean }> => {
    const response = await fetch('/api/gamification/config', { signal, cache: 'no-store' })
    if (!response.ok) throw new Error('활동 기능 상태를 확인하지 못했어요.')
    return response.json()
  },
}
export async function withActivitySession<T>(
  session: ActivitySession,
  request: (config: ApiRequestConfig) => Promise<T>,
): Promise<T> {
  if (!isActivitySessionCurrent(session)) {
    notifyAuthStateChanged()
    throw new Error('로그인 정보를 다시 확인해 주세요.')
  }
  let result: T
  try {
    result = await request({
      headers: { Authorization: `Bearer ${session.token}` },
      skipAuth: true,
      skipAuthRefresh: true,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && isActivitySessionCurrent(session)) {
      // Refresh credentials only. The new scope reloads its data; never replay an old mutation.
      try {
        await refreshAuthSession()
      } catch {
        // Shared recovery preserves credentials on network errors and clears expired sessions.
      }
    }
    notifyAuthStateChanged()
    throw error
  }
  if (!isActivitySessionCurrent(session)) {
    notifyAuthStateChanged()
    throw new Error('계정이 변경됐어요. 새 계정의 활동을 확인해 주세요.')
  }
  return result
}
export async function getActivity(
  session: ActivitySession,
  signal?: AbortSignal,
): Promise<ActivityView> {
  return withActivitySession(session, async (config) =>
    unwrap(
      await apiClient.get<ApiResponseFull<ActivityView>>(`${API_VERSION}/gamification/me`, {
        ...config,
        signal,
      }),
    ),
  )
}
export async function synchronizeActivity(
  session: ActivitySession,
  signal?: AbortSignal,
): Promise<ActivityView> {
  return withActivitySession(session, async (config) =>
    unwrap(
      await apiClient.post<ApiResponseFull<ActivityView>>(
        `${API_VERSION}/gamification/me/sync`,
        {},
        { ...config, signal, timeout: 30000 },
      ),
    ),
  )
}
export async function displayActivityBadges(
  session: ActivitySession,
  keys: string[],
  signal?: AbortSignal,
): Promise<ActivityView> {
  return withActivitySession(session, async (config) =>
    unwrap(
      await apiClient.patch<ApiResponseFull<ActivityView>>(
        `${API_VERSION}/gamification/me/display-badges`,
        { keys },
        { ...config, signal },
      ),
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

export async function getActivityCatalog(
  signal?: AbortSignal,
): Promise<import('../model/levels').ActivityCatalog> {
  const config: ApiRequestConfig = { signal, skipAuth: true, skipAuthRefresh: true }
  return unwrap(await apiClient.get(`${API_VERSION}/gamification/catalog`, config))
}

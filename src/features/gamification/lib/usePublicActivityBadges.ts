'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  activityConfigOptions,
  getPublicActivityBadges,
  type ActivityBadgeOwner,
} from '@/entities/gamification'
export function usePublicActivityBadges(owners: ActivityBadgeOwner[]) {
  const config = useQuery(activityConfigOptions)
  const keys = [...new Set(owners.map((owner) => `${owner.role}:${owner.ownerId}`))].sort()
  const badges = useQuery({
    queryKey: ['gamification', 'public', ...keys],
    queryFn: ({ signal }) => getPublicActivityBadges(owners, signal),
    enabled: config.data?.enabled === true && !config.isError && owners.length > 0,
    retry: false,
    staleTime: 30_000,
    refetchInterval: 30_000,
    // 다음 페이지가 붙으면 작성자 목록(키)이 바뀐다. 새 응답 전까지 이전 배지를 유지해 배지가 비었다가 다시 뜨지 않게 한다.
    placeholderData: keepPreviousData,
    throwOnError: false,
  })
  return config.data?.enabled && !config.isError && !badges.isError
    ? (badges.data ?? []).map((owner) => ({
        ...owner,
        level: config.data?.breederLevelPublic ? owner.level : null,
      }))
    : []
}

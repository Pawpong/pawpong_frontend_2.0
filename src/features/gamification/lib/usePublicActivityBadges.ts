'use client'
import { useQuery } from '@tanstack/react-query'
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
    throwOnError: false,
  })
  return config.data?.enabled && !config.isError && !badges.isError
    ? (badges.data ?? []).map((owner) => ({
        ...owner,
        level: config.data?.breederLevelPublic ? owner.level : null,
      }))
    : []
}

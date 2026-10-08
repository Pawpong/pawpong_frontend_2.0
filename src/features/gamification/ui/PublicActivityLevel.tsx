'use client'
import { BreederLevelBadge, type ActivityBadgeOwner } from '@/entities/gamification'
import { usePublicActivityBadges } from '../lib/usePublicActivityBadges'
export function PublicActivityLevel({
  owner,
  showFamily = true,
  interactive = true,
}: {
  owner: ActivityBadgeOwner
  showFamily?: boolean
  interactive?: boolean
}) {
  const rows = usePublicActivityBadges([owner])
  return (
    <BreederLevelBadge level={rows[0]?.level} showFamily={showFamily} interactive={interactive} />
  )
}

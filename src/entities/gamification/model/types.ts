export interface ActivityBadge {
  key: string
  title: string
  description: string
  target: number
  progress: number
  state: 'locked' | 'earned' | 'revoked'
  earnedAt: string | null
}
export interface ActivityView {
  policyVersion: string
  totalExp: number
  revision: number
  updatedAt: string | null
  displayBadges: string[]
  byActivity: Record<string, number>
  badges: ActivityBadge[]
  history: Array<{
    kind: string
    delta: number
    reason: 'earned' | 'revoked' | 'restored'
    at: string
  }>
}
export interface PublicActivityBadge {
  key: string
  title: string
  description: string
  earnedAt: string
}
export interface ActivityBadgeOwner {
  ownerId: string
  role: 'adopter' | 'breeder'
}
export interface PublicActivityBadges extends ActivityBadgeOwner {
  badges: PublicActivityBadge[]
}

/** BE .kiro/specs/playground-pet/contract.md / dev-v1. 상태와 보상은 서버가 결정한다. */
export type PetAction = 'greet' | 'feed' | 'play' | 'rest'
export type PetQuest = Exclude<PetAction, 'rest'>
export type PetConfig = { enabled: boolean; policyVersion?: string }
export type EligiblePetImage = { sourceJobId: string; imageUrl: string; createdAt: string }
export type EligiblePetImages = { images: EligiblePetImage[]; nextCursor: string | null }
export type PetAvailability = {
  allowed: boolean
  rewardAvailable: boolean
  nextAvailableAt: string | null
  reason: 'COOLDOWN' | 'DAILY_LIMIT' | 'LOW_ENERGY' | 'RESTING' | null
}
export type PetView = {
  pet: {
    id: string
    sourceJobId: string
    imageUrl: string
    name: string
    level: number
    totalXp: number
    xpForCurrentLevel: number
    xpForNextLevel: number | null
    stats: { fullness: number; mood: number; energy: number; affinity: number }
    restEndsAt: string | null
    revision: number
    policyVersion: string
    createdAt: string
  } | null
  daily: {
    dayKey: string
    xp: number
    maxXp: number
    quests: { id: PetQuest; completed: boolean; rewardXp: number }[]
    rewardCounts: Record<PetAction, number>
  }
  actions: Record<PetAction, PetAvailability> | null
  week: { daysTogether: number; totalDays: number }
  unlocks: string[]
  records: {
    id: string
    type: 'adopted' | 'first_meal' | 'level_up' | 'unlock' | 'seven_days'
    at: string
    level?: number
    unlock?: string
  }[]
  serverTime: string
}
export type PetMutationView = PetView & {
  outcome: { action: PetAction | 'adopt'; xpAwarded: number; affinityAwarded: number }
}
export type PetCommand =
  | { kind: 'adopt'; body: { sourceJobId: string; name: string; idempotencyKey: string } }
  | {
      kind: 'actions'
      body: { action: PetAction; expectedRevision: number; idempotencyKey: string }
    }

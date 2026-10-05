/** BE .kiro/specs/playground-pet/contract.md / dev-v1. 상태와 보상은 서버가 결정한다. */
export type PetAction = 'greet' | 'feed' | 'play' | 'rest'
export type PetQuest = Exclude<PetAction, 'rest'>
export type PetConfig = { enabled: boolean; policyVersion?: string; publicEnabled?: boolean }
export type EligiblePetImage = { sourceJobId: string; imageUrl: string; createdAt: string }
export type EligiblePetImages = { images: EligiblePetImage[]; nextCursor: string | null }
export type PetAvailability = {
  allowed: boolean
  rewardAvailable: boolean
  nextAvailableAt: string | null
  reason: 'COOLDOWN' | 'DAILY_LIMIT' | 'LOW_ENERGY' | 'RESTING' | null
}
export type PetRoomSlot = 'wallpaper' | 'floor' | 'bed' | 'toy' | 'plant' | 'decoration'
export type PetGameKind = 'memory' | 'snack'
export type PetCatalogItem = {
  id: string
  name: string
  description: string
  slot: PetRoomSlot
  price: number
  minLevel: number
  assetKey: string
  collection: string
}
export type PetRoomState = Record<PetRoomSlot, string | null>
export type SnackLane = 0 | 1 | 2
export type SnackInput = { tMs: number; lane: SnackLane }
export type SnackDrop = { lane: SnackLane; landingAtMs: number; kind: 'snack' | 'hazard' }
type GameSessionBase = {
  sessionId: string
  startedAt: string
  expiresAt: string
  status: 'active' | 'finished' | 'cancelled' | 'expired'
  rewardEligible: boolean
}
/** Only server-revealed symbols are public. There is no hidden deck in the browser. */
export type PetMemorySession = GameSessionBase & {
  game: 'memory'
  cardCount: 8
  pairCount: 4
  revealed: { index: number; symbol: 'paw' | 'bone' | 'heart' | 'star' }[]
  matchedIndices: number[]
  turns: number
  flips: number
  maxFlips: 40
  lockUntil: string | null
}
export type PetSnackSession = GameSessionBase & {
  game: 'snack'
  durationMs: number
  laneCount: 3
  initialLane: 1
  drops: SnackDrop[]
}
export type PetGameSession = PetMemorySession | PetSnackSession
export type PetGameState = {
  wallet: { stars: number; dailyEarned: number; dailyLimit: number }
  inventory: string[]
  room: PetRoomState
  catalog: PetCatalogItem[]
  games: {
    rewardedToday: number
    dailyRewardLimit: number
    bestScores: Record<PetGameKind, number>
    active: PetGameSession | null
  }
  achievements: {
    id: string
    label: string
    completed: boolean
    progress: number
    target: number
  }[]
  gamePolicyVersion: 'classic-v2'
}
export type PetGameOutcome = {
  kind: 'purchase' | 'equip' | 'start' | 'cancel' | 'flip' | 'finish'
  starsDelta: number
  itemId?: string | null
  slot?: PetRoomSlot
  game?: PetGameKind
  sessionId?: string
  score?: number
  rewarded?: boolean
  session?: PetGameSession
  summary?: { catches: number; misses: number; hazards: number }
}
export type PetView = {
  /** Additive field: an older server can still show care while its v2 rollout is pending. */
  game?: PetGameState | null
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
  outcome?: {
    action: PetAction | 'adopt'
    xpAwarded: number
    affinityAwarded: number
    starsAwarded?: number
  }
  gameOutcome?: PetGameOutcome
}
type RevisionCommand = { expectedRevision: number; idempotencyKey: string }
export type PetCommand =
  | { kind: 'adopt'; body: { sourceJobId: string; name: string; idempotencyKey: string } }
  | {
      kind: 'actions'
      body: { action: PetAction; expectedRevision: number; idempotencyKey: string }
    }
  | { kind: 'items/purchase'; body: RevisionCommand & { itemId: string } }
  | { kind: 'room'; body: RevisionCommand & { slot: PetRoomSlot; itemId: string | null } }
  | { kind: 'games/start'; body: RevisionCommand & { game: PetGameKind } }
  | { kind: 'games/cancel'; body: RevisionCommand & { sessionId: string } }
  | { kind: 'games/memory/flip'; body: RevisionCommand & { sessionId: string; index: number } }
  | {
      kind: 'games/snack/finish'
      body: RevisionCommand & { sessionId: string; inputs: SnackInput[] }
    }

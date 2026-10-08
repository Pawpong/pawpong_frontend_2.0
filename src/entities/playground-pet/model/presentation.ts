import type { PetAvailability, PetView } from './types'

export const PET_ACTION_LABELS = {
  greet: '인사하기',
  feed: '밥 주기',
  play: '놀아주기',
  rest: '쉬게 하기',
} as const

export function normalizePetName(value: string): string {
  return value.trim().normalize('NFC')
}

export function isValidPetName(value: string): boolean {
  const normalized = normalizePetName(value)
  return (
    Array.from(normalized).length >= 1 &&
    Array.from(normalized).length <= 12 &&
    !/[\p{Cc}\p{Cf}]/u.test(normalized)
  )
}

/** 멱등 재전송은 과거 응답을 반환하므로 낮은 revision으로 되돌리지 않는다. */
export function latestPetView(current: PetView | undefined, incoming: PetView): PetView {
  if (
    current?.pet &&
    incoming.pet?.id === current.pet.id &&
    incoming.pet.revision < current.pet.revision
  )
    return current
  return incoming
}

export function petLevelProgress(pet: NonNullable<PetView['pet']>): number {
  if (pet.xpForNextLevel === null) return 100
  const range = pet.xpForNextLevel - pet.xpForCurrentLevel
  return range > 0
    ? Math.max(0, Math.min(100, ((pet.totalXp - pet.xpForCurrentLevel) / range) * 100))
    : 0
}

export function remainingSeconds(next: string | null, serverNow: number): number {
  return next ? Math.max(0, Math.ceil((Date.parse(next) - serverNow) / 1000)) : 0
}

export function formatPetWait(seconds: number): string {
  if (seconds <= 0) return '가능 시간을 확인하고 있어요'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}분 뒤에 만나요`
  return `${Math.floor(minutes / 60)}시간${minutes % 60 ? ` ${minutes % 60}분` : ''} 뒤에 만나요`
}

const KST_OFFSET = 9 * 60 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000
const kstDay = (time: number) => Math.floor((time + KST_OFFSET) / DAY)

/** 처음 함께한 날을 1일째로 세는 한국 날짜 기준 함께한 날 수. 날짜를 읽을 수 없으면 null. */
export function petDaysTogether(createdAt: string, serverTime: string): number | null {
  const start = Date.parse(createdAt)
  const now = Date.parse(serverTime)
  if (!Number.isFinite(start) || !Number.isFinite(now) || now < start) return null
  return kstDay(now) - kstDay(start) + 1
}

/** 돌봄 버튼 아래에 짧게 보여줄 다음 가능 시점. 기다릴 필요가 없으면 null. */
export function petWaitShort(availability: PetAvailability, serverNow: number): string | null {
  if (availability.allowed) return null
  if (availability.reason === 'LOW_ENERGY') return '쉬고 나서'
  const seconds = remainingSeconds(availability.nextAvailableAt, serverNow)
  if (seconds <= 0) return availability.reason === 'DAILY_LIMIT' ? '내일' : null
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes}분 뒤`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}시간 ${rest}분 뒤` : `${hours}시간 뒤`
}

export function petActionHint(availability: PetAvailability, serverNow: number): string {
  // 인사는 보상 시간을 기다리는 동안에도 서버가 허용할 수 있다.
  if (availability.allowed)
    return availability.rewardAvailable
      ? '함께 돌보고 경험치를 모아요'
      : '경험치 없이도 함께할 수 있어요'
  if (availability.reason === 'LOW_ENERGY') return '먼저 쉬며 에너지를 채워 주세요'
  if (availability.nextAvailableAt)
    return formatPetWait(remainingSeconds(availability.nextAvailableAt, serverNow))
  if (availability.reason === 'DAILY_LIMIT') return '오늘의 돌봄을 모두 했어요'
  return '지금은 잠시 기다려 주세요'
}

export function petErrorMessage(status?: number, code?: string): string {
  if (status === 401) return '로그인이 만료됐어요. 다시 로그인해 주세요.'
  if (status === 403) return '이 계정에서는 반려동물 키우기를 이용할 수 없어요.'
  if (status === 404)
    return '선택한 그림을 불러올 수 없어요. 사용 가능한 그림을 다시 확인해 주세요.'
  if (code === 'PET_ALREADY_EXISTS')
    return '이미 키우고 있는 반려동물이 있어요. 우리 아이의 방을 다시 불러왔어요.'
  // 화면이 최신 상태를 다시 불러오는 사이에도 생길 수 있어 다른 기기 사용으로 단정하지 않는다.
  if (code === 'REVISION_CONFLICT')
    return '방금 우리 아이 상태가 새로 고쳐졌어요. 최신 상태를 확인한 뒤 다시 눌러 주세요.'
  if (code === 'COOLDOWN' || code === 'RESTING')
    return '아직 쉬어 갈 시간이에요. 다음 돌봄 시간을 확인해 주세요.'
  if (code === 'DAILY_LIMIT') return '오늘의 돌봄 보상을 모두 받았어요.'
  if (code === 'LOW_ENERGY') return '놀이 전에 잠깐 쉬며 에너지를 채워 주세요.'
  if (code === 'SOURCE_CHANGED') return '그림의 상태가 바뀌었어요. 사용할 그림을 다시 골라 주세요.'
  if (code === 'INSUFFICIENT_STARS') return '별사탕이 부족해요. 돌봄과 미니게임으로 모아 주세요.'
  if (code === 'ITEM_OWNED') return '이미 가지고 있는 소품이에요. 인벤토리를 확인해 주세요.'
  if (code === 'LEVEL_REQUIRED' || code === 'LEVEL_LOCKED')
    return '조금 더 자라면 사용할 수 있어요.'
  if (code === 'ITEM_NOT_OWNED') return '먼저 이 소품을 별사탕으로 받아 주세요.'
  if (code === 'GAME_ACTIVE') return '진행 중인 게임이 있어요. 이어 하거나 종료해 주세요.'
  if (code === 'GAME_EXPIRED') return '게임 시간이 만료됐어요. 새 게임을 시작해 주세요.'
  if (code === 'GAME_FINISHED') return '이미 끝난 게임이에요. 저장된 결과를 확인해 주세요.'
  if (code === 'GAME_CANCELLED') return '종료한 게임이에요. 새 게임을 시작해 주세요.'
  if (code === 'MEMORY_LOCKED' || code === 'FLIP_TOO_FAST')
    return '카드를 확인하는 중이에요. 잠깐 기다려 주세요.'
  if (code === 'GAME_FLIP_LIMIT')
    return '이번 판의 뒤집기 횟수를 모두 썼어요. 종료하고 다시 시작해 주세요.'
  if (code === 'CARD_UNAVAILABLE') return '이미 맞춘 카드예요. 다른 카드를 골라 주세요.'
  if (code === 'GAME_NOT_ACTIVE') return '진행 중인 게임을 다시 확인해 주세요.'
  if (code === 'IDEMPOTENCY_CONFLICT')
    return '이 요청은 이미 처리됐어요. 최신 상태를 다시 확인해 주세요.'
  if (code === 'GAME_TOO_EARLY') return '아직 게임이 끝나지 않았어요. 잠시 뒤 결과를 확인해 주세요.'
  return '요청을 완료하지 못했어요. 상태를 다시 확인해 주세요.'
}

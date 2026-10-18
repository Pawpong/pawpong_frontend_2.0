import type { PetAction, PetView } from './types'

export type PetMoodKind = 'hungry' | 'sleepy' | 'bored' | 'happy' | 'resting'
export type PetMood = { kind: PetMoodKind; label: string; action: PetAction | null }

type Stats = NonNullable<PetView['pet']>['stats']

/** 서버가 준 수치만 읽는 표시용 해석이다. 수치·보상·쿨다운을 바꾸지 않는다. */
export function petMood(stats: Stats, resting: boolean): PetMood | null {
  if (resting) return { kind: 'resting', label: '포근하게 쉬고 있어요', action: null }
  if (stats.fullness < 35) return { kind: 'hungry', label: '배가 고파 보여요', action: 'feed' }
  if (stats.energy < 30) return { kind: 'sleepy', label: '졸려 보여요', action: 'rest' }
  if (stats.mood < 40) return { kind: 'bored', label: '심심해 보여요', action: 'play' }
  if (stats.fullness >= 70 && stats.mood >= 70 && stats.energy >= 50)
    return { kind: 'happy', label: '기분이 아주 좋아요', action: null }
  return null
}

/** 화면이 열려 있는 동안 서버 레벨이 오른 순간만 알린다. 다른 친구로 바뀌면 알리지 않는다. */
export function petLevelUp(
  previous: { id: string; level: number } | null,
  pet: { id: string; level: number },
): number | null {
  return previous && previous.id === pet.id && pet.level > previous.level ? pet.level : null
}

export function formatPetCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

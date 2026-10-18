import {
  BTI_NAME,
  BTI_PROFILES,
  BTI_QUESTIONS,
  OUTING_DECKS,
  PLAY_CARD_NOTICE,
  TASTE_CARDS,
  TASTE_ORDER,
  TASTE_QUESTIONS,
} from '../constants/discovery'
import type {
  BtiLetter,
  BtiParts,
  BtiType,
  OutingPace,
  OutingSetting,
  PlayAccent,
  PlayCard,
} from './discovery.types'
import type { MemoryTheme } from './memoryCard'

export function outingDeckSize(setting: OutingSetting, pace: OutingPace) {
  return OUTING_DECKS[setting][pace].length
}

// 고른 묶음에서 turn 번째 카드를 꺼낸다. 같은 turn이면 항상 같은 카드라서 결과를 다시 설명할 수 있다.
export function outingCard(setting: OutingSetting, pace: OutingPace, turn: number): PlayCard {
  const deck = OUTING_DECKS[setting][pace]
  const index = Number.isSafeInteger(turn) && turn >= 0 ? turn % deck.length : 0
  return deck[index]
}

export function tasteResult(answers: readonly number[]): PlayCard | null {
  if (
    answers.length !== TASTE_QUESTIONS.length ||
    answers.some(
      (answer) => !Number.isInteger(answer) || answer < 0 || answer >= TASTE_ORDER.length,
    )
  )
    return null
  const scores = TASTE_ORDER.map((_, index) => answers.filter((answer) => answer === index).length)
  const highest = Math.max(...scores)
  // 동점일 때는 마지막으로 고른 오늘의 장면에 가까운 선택을 우선한다.
  const winner = [...answers].reverse().find((answer) => scores[answer] === highest)!
  return TASTE_CARDS[TASTE_ORDER[winner]]
}

const btiCode = ([ei, sn, tf, jp]: BtiParts): BtiType => `${ei}${sn}${tf}${jp}`

function btiCard(parts: BtiParts): PlayCard {
  const [ei, sn, tf, jp] = parts
  const type = btiCode(parts)
  const profile = BTI_PROFILES[type]
  // 찰떡 친구: 속(S/N·T/F)은 같고 겉(E/I·J/P)은 반대라 서로 채워 주는 짝으로 흔히 쓰는 규칙
  const partner = btiCode([ei === 'E' ? 'I' : 'E', sn, tf, jp === 'J' ? 'P' : 'J'])
  return {
    id: `bti-${type.toLowerCase()}`,
    label: `${BTI_NAME} 결과`,
    title: `${type} ${profile.title}`,
    description: profile.description,
    moments: [
      `닮은 모습: ${profile.trait}`,
      `어울리는 놀이: ${profile.play}`,
      `찰떡 친구: ${partner} ${BTI_PROFILES[partner].title}`,
    ],
    // 기질(NF·NT·SJ·SP)마다 한 색
    accent: sn === 'N' ? (tf === 'F' ? 'peach' : 'blue') : jp === 'J' ? 'butter' : 'green',
    memoryMessage: profile.memoryMessage,
  }
}

export const BTI_CARDS: readonly PlayCard[] = (['E', 'I'] as const).flatMap((ei) =>
  (['S', 'N'] as const).flatMap((sn) =>
    (['T', 'F'] as const).flatMap((tf) =>
      (['J', 'P'] as const).map((jp) => btiCard([ei, sn, tf, jp])),
    ),
  ),
)

export function btiResult(answers: readonly number[]): PlayCard | null {
  if (
    answers.length !== BTI_QUESTIONS.length ||
    answers.some((answer) => answer !== 0 && answer !== 1)
  )
    return null
  const letters = answers.map((answer, index) => BTI_QUESTIONS[index].options[answer].letter)
  // 축마다 3문항이라 둘 중 한쪽이 반드시 더 많다
  const pick = <A extends BtiLetter, B extends BtiLetter>(a: A, b: B) =>
    letters.filter((letter) => letter === a).length >
    letters.filter((letter) => letter === b).length
      ? a
      : b
  return btiCard([pick('E', 'I'), pick('S', 'N'), pick('T', 'F'), pick('J', 'P')])
}

export function playCardText(card: PlayCard) {
  return [
    `포퐁 · ${card.label}`,
    card.title,
    card.description,
    ...card.moments,
    PLAY_CARD_NOTICE,
  ].join('\n')
}

const ALL_PLAY_CARDS: readonly PlayCard[] = [
  ...Object.values(OUTING_DECKS).flatMap((paces) => Object.values(paces).flat()),
  ...Object.values(TASTE_CARDS),
  ...BTI_CARDS,
]

// 주소의 play 값은 사용자가 바꿀 수 있으므로 고정 목록에 있는 식별자만 받아들인다.
export function findPlayCard(id: string | null | undefined): PlayCard | null {
  if (typeof id !== 'string' || id.length > 40) return null
  return ALL_PLAY_CARDS.find((card) => card.id === id) ?? null
}

const MEMORY_THEME_BY_ACCENT: Record<PlayAccent, MemoryTheme> = {
  butter: 'butter',
  peach: 'butter',
  green: 'mint',
  blue: 'lavender',
}

export function memoryCardSeed(id: string | null | undefined) {
  const card = findPlayCard(id)
  if (!card) return null
  return {
    title: card.title,
    message: card.memoryMessage,
    theme: MEMORY_THEME_BY_ACCENT[card.accent],
  }
}

export function memoryCardHref(card: PlayCard) {
  return `/playground/memory-card?play=${encodeURIComponent(card.id)}`
}

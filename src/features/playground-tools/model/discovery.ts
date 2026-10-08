import {
  OUTING_DECKS,
  PLAY_CARD_NOTICE,
  TASTE_CARDS,
  TASTE_ORDER,
  TASTE_QUESTIONS,
} from '../constants/discovery'
import type { OutingPace, OutingSetting, PlayAccent, PlayCard } from './discovery.types'
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

import { ALL_PLAY_CARDS } from './discovery'
import { TASTE_CARDS } from '../constants/discovery'
import type { PlayCard } from './discovery.types'

export const PLAY_CARD_GROUPS = [
  {
    id: 'outing',
    title: '오늘의 산책 뽑기',
    description: '동네에서도 집에서도, 함께할 작은 즐거움.',
    href: '/playground/walk-card',
  },
  {
    id: 'taste',
    title: '우리 아이 취향 찾기',
    description: '네 가지 질문으로 떠올려 보는 오늘의 취향.',
    href: '/playground/taste',
  },
  {
    id: 'bti',
    title: '우리 아이 멍냥BTI',
    description: '열두 가지 질문으로 즐기는 16가지 성향 놀이.',
    href: '/playground/bti',
  },
] as const

export function playCardKind(card: PlayCard): 'outing' | 'taste' | 'bti' {
  // The outing deck also contains "taste-detective"; its name is not its game type.
  return card.id.startsWith('bti-')
    ? 'bti'
    : Object.values(TASTE_CARDS).some((result) => result.id === card.id)
      ? 'taste'
      : 'outing'
}
export const playCardHref = (card: PlayCard) => `/playground/cards/${encodeURIComponent(card.id)}`
export const playCardUrl = (card: PlayCard, origin = 'https://pawpong.kr') =>
  new URL(playCardHref(card), origin).href
export const playCardStart = (card: PlayCard) =>
  PLAY_CARD_GROUPS.find((group) => group.id === playCardKind(card))!
export const cardsInGroup = (group: string) =>
  ALL_PLAY_CARDS.filter((card) => playCardKind(card) === group)

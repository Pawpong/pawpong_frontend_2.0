import type { FeatureHighlight, FeatureHighlightConfig, HighlightPlacement } from './types'

// 백엔드 feature-highlights 계약의 출시된 조회 화면만 허용한다.
export const HIGHLIGHT_DESTINATIONS = [
  '/care-map',
  '/care-map?kind=hospital',
  '/care-map?kind=shelter',
  '/ai-filter',
  '/community',
  '/explore',
  '/explore?type=breeder',
  '/explore?type=adoption',
] as const

const placements = ['home', 'explore', 'playground']
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0)

export function isHighlightDestination(href: unknown): href is string {
  return typeof href === 'string' && HIGHLIGHT_DESTINATIONS.some((value) => value === href)
}

function isCard(card: unknown): card is FeatureHighlight {
  if (!isRecord(card)) return false
  return (
    typeof card.id === 'string' &&
    /^[a-z0-9][a-z0-9-]{0,49}$/.test(card.id) &&
    text(card.eyebrow, 20) &&
    text(card.title, 50, true) &&
    text(card.description, 140) &&
    typeof card.icon === 'string' &&
    ['map', 'spark', 'heart'].includes(card.icon) &&
    typeof card.enabled === 'boolean' &&
    Array.isArray(card.placements) &&
    card.placements.length >= 1 &&
    card.placements.length <= 3 &&
    new Set(card.placements).size === card.placements.length &&
    card.placements.every((value) => typeof value === 'string' && placements.includes(value)) &&
    Array.isArray(card.actions) &&
    card.actions.length >= 1 &&
    card.actions.length <= 2 &&
    card.actions.every(
      (action) =>
        isRecord(action) && text(action.label, 20, true) && isHighlightDestination(action.href),
    )
  )
}

/** 빈 설정과 잘못된 응답을 구분하고, 응답의 임의 URL/추가 필드는 렌더링하지 않는다. */
export function parseFeatureHighlightConfig(value: unknown): FeatureHighlightConfig {
  if (
    !isRecord(value) ||
    typeof value.revision !== 'number' ||
    !Number.isSafeInteger(value.revision) ||
    value.revision < 0 ||
    value.revision >= Number.MAX_SAFE_INTEGER ||
    !Array.isArray(value.cards) ||
    value.cards.length > 12 ||
    !value.cards.every(isCard) ||
    new Set(value.cards.map((card) => card.id)).size !== value.cards.length
  ) {
    throw new Error('신기능 소개 설정을 확인할 수 없습니다.')
  }
  return {
    revision: value.revision,
    cards: value.cards.map((card) => ({
      id: card.id,
      eyebrow: card.eyebrow,
      title: card.title,
      description: card.description,
      icon: card.icon,
      enabled: card.enabled,
      placements: [...card.placements],
      actions: card.actions.map(({ label, href }) => ({ label, href })),
    })),
  }
}

export function isCareMapHighlight(card: FeatureHighlight) {
  return (
    card.id === 'care-map' ||
    card.icon === 'map' ||
    card.actions.some(({ href }) => href === '/care-map' || href.startsWith('/care-map?'))
  )
}

export function visibleHighlights(config: FeatureHighlightConfig, placement: HighlightPlacement) {
  return config.cards.filter(
    (card) =>
      card.enabled &&
      card.placements.includes(placement) &&
      !(placement === 'explore' && isCareMapHighlight(card)),
  )
}

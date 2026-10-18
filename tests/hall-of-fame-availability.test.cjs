const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript } = require('./helpers/load-typescript.cjs')
const { PodiumCard, toRankSlots } = loadTypescript('src/widgets/hall-of-fame/ui/HallOfFamePodium.tsx', {
  '@/shared/ui/SessionImage': { SessionImage: () => null },
  '@/shared/lib/useAuthReadSession': { useAuthReadSession: () => null },
  '@/shared/lib/sessionImageSource': { isSessionImageSource: () => false },
  'next/link': { default: ({ children }) => children },
  'swiper/react': {},
  'swiper/css': {},
  '@/shared/assets': { PawPrintIcon: () => null, FavoriteIcon: () => null },
  '@/shared/ui': { ProfileAvatar: () => null },
  '@/shared/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
})

test('열람 불가 수상작은 수상자 없음이나 집계 대기로 표시하지 않음', () => {
  for (const state of ['open', 'final']) {
    const html = renderToStaticMarkup(createElement(PodiumCard, { rank: 1, state, unavailable: true }))
    assert.match(html, /현재 열람 불가/)
    assert.match(html, /수상 기록은 유지되지만 게시글은 볼 수 없어요/)
    assert.doesNotMatch(html, /선정된 글 없음|집계 중|아직 후보가 없어요|href=/)
  }
})

test('실제 빈 자리는 회차 상태에 맞게 표시하고 남은 수상작 순위를 당기지 않음', () => {
  const html = renderToStaticMarkup(createElement(PodiumCard, { rank: 3, state: 'final' }))
  assert.match(html, /선정된 글 없음/)
  assert.doesNotMatch(html, /현재 열람 불가/)
  const winner = { rank: 2, postId: 'visible' }
  assert.deepEqual(toRankSlots([winner]), [
    { rank: 1, winner: undefined }, { rank: 2, winner }, { rank: 3, winner: undefined },
  ])
})

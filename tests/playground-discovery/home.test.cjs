const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/discovery.fixture.cjs')

const ui = 'src/features/playground-tools/ui'

test('놀이터는 놀이와 돌봄 이미지 레일로 나누고 반려동물 기능 설정을 유지함', () => {
  const home = source('src/app/(main)/playground/_ui/PlaygroundContent.tsx')
  assert.equal((home.match(/<PlaygroundFeatureRail/g) ?? []).length, 2)
  for (const route of [
    '/ai-filter',
    '/playground/memory-card',
    '/playground/pet',
    '/playground/walk-card',
    '/playground/taste',
    '/playground/bti',
    '/community/write?experience=walk',
    '/playground/outing',
    '/community/write?experience=clinic',
  ])
    assert.ok(home.includes(route), route)
  assert.match(home, /petConfig.data\?\.enabled && !petConfig.isError/)
})

test('돌봄 도구는 세 목적지와 위치 공개 안내를 유지하고 링크 전체로 이동할 수 있음', () => {
  const { PlaygroundCareShelf } = loadTypescript(`${ui}/PlaygroundCareShelf.tsx`, {
    'next/link': {
      __esModule: true,
      default: ({ href, ...props }) => createElement('a', { href, ...props }),
    },
    '@/shared/assets': {
      LocationPinIcon: () => null,
      PixelCheckIcon: () => null,
      PixelPencilIcon: () => null,
      PixelArrowRightIcon: () => null,
    },
  })
  const html = renderToStaticMarkup(createElement(PlaygroundCareShelf))
  assert.equal((html.match(/<a /g) ?? []).length, 3)
  for (const href of [
    '/community/write?experience=walk',
    '/playground/outing',
    '/community/write?experience=clinic',
  ])
    assert.ok(html.includes(`href="${href}"`), href)
  for (const label of ['사진 올리기', '준비물 챙기기', '기록 남기기', '확인한 장소만 공개'])
    assert.ok(html.includes(label), label)
  assert.doesNotMatch(html, /<button/)
})

test('놀이터 커버는 새 로컬 에셋을 사용하고 스크롤과 모션 줄이기를 지원함', () => {
  const rail = source('src/app/(main)/playground/_ui/PlaygroundFeatureRail.tsx')
  assert.ok(rail.includes('/images/playground/covers/'))
  assert.match(rail, /snap-x snap-mandatory/)
  assert.match(rail, /prefers-reduced-motion: reduce/)
  assert.match(rail, /aria-controls=/)
  const { existsSync } = require('node:fs')
  for (const key of [
    'ai-photo',
    'memory',
    'pet',
    'walk',
    'taste',
    'bti',
    'walk-photo',
    'outing',
    'clinic',
  ])
    assert.ok(existsSync('public/images/playground/covers/' + key + '-v1.png'), key)
})

test('서비스 소개와 앱 안내도 놀이터와 같은 소개 박스와 티켓 링크를 씀', () => {
  for (const file of ['src/app/(main)/about/page.tsx', 'src/app/(main)/app/page.tsx']) {
    const page = source(file)
    assert.match(page, /<FeatureIntro\b/, file)
    assert.match(page, /<TicketLink\b/, file)
    // 장식 화살표 글자는 읽지 않게 감싸거나 픽셀 아이콘으로 바꾼다.
    assert.doesNotMatch(page, /(?<!<span aria-hidden>)[\u2192\u2197]/, file)
  }
})

test('기능 소개도 PLAY CARD 와 같은 티켓 틀에 띠 라벨과 절취선 아래 순서를 둠', () => {
  const cn = (...values) => values.filter(Boolean).join(' ')
  const ticket = loadTypescript('src/shared/ui/Ticket.tsx', {
    'next/link': ({ href, ...props }) => createElement('a', { href, ...props }),
    '@/shared/assets': { PixelArrowRightIcon: () => null },
    '@/shared/lib/cn': { cn },
  })
  const { ticketStyles } = ticket
  const { FeatureShowcase } = loadTypescript('src/shared/ui/FeatureShowcase.tsx', {
    'next/image': () => null,
    '@/shared/assets': { PawPrintIcon: () => null },
    '@/shared/lib/cn': { cn },
    './Skeleton': { SkeletonBlock: () => null },
    './Ticket': ticket,
  })
  const html = renderToStaticMarkup(
    createElement(FeatureShowcase, {
      headingId: 'demo',
      label: 'AI PHOTO',
      accent: 'peach',
      eyebrow: '사진으로 노는 시간',
      title: 'AI 사진 만들기',
      description: '설명',
      actions: null,
      media: null,
      steps: ['고르기', '만들기'],
    }),
  )
  assert.ok(
    html.startsWith(
      `<section aria-labelledby="demo" data-accent="peach" class="${ticketStyles.ticket}">`,
    ),
  )
  assert.ok(html.includes(`<span class="${ticketStyles.strip}"><span>AI PHOTO</span></span>`))
  assert.match(html, /<p class="[^"]*text-primary-600">사진으로 노는 시간<\/p><h2 id="demo"/)
  assert.ok(html.includes(`<ol class="${ticketStyles.stub} `))
  assert.ok(html.includes(`<span class="${ticketStyles.stubNumber}">1</span>고르기</li>`))
  // 놀이 카드 셋은 노트북부터 한 줄에 놓이고 태블릿에서는 마지막 카드가 혼자 남지 않는다.
  const shelf = source('src/features/playground-tools/ui/PlaygroundPlayShelf.tsx')
  assert.match(shelf, /tab:grid-cols-2 lap:grid-cols-3/)
  assert.match(shelf, /tab:last:odd:col-span-2 lap:last:odd:col-span-1/)
})

test('놀이터 아래 돌봄 지도 카드도 초록 CARE MAP 티켓에 버튼 두 개를 둠', () => {
  // 돌봄 지도 입구와 새 기능 소개는 같은 공통 카드(TicketActionCard)를 쓴다.
  const ticketActionCard = loadTypescript('src/shared/ui/TicketActionCard.tsx', {
    'next/link': { __esModule: true, default: (props) => createElement('a', props) },
    '@/shared/assets': { PixelArrowRightIcon: () => null },
    './Button': { buttonVariants: ({ intent }) => `button-${intent}` },
    './Ticket': {
      ticketStyles: { ticket: 'ticket' },
      TicketStrip: ({ label }) => createElement('span', { className: 'strip' }, label),
    },
  })
  const { CareMapEntry } = loadTypescript('src/widgets/care-map-entry/ui/CareMapEntry.tsx', {
    '@/shared/assets': { LocationPinIcon: () => null },
    '@/shared/ui': { Container: ({ children }) => createElement('div', {}, children) },
    '@/shared/ui/TicketActionCard': ticketActionCard,
  })
  const html = renderToStaticMarkup(createElement(CareMapEntry, { embedded: true }))
  assert.match(
    html,
    /^<section aria-label="우리 동네 돌봄 지도" data-accent="green" class="ticket"><span class="strip">CARE MAP<\/span>/,
  )
  assert.match(html, /<div><a href="\/care-map" class="button-primary">동물병원 찾기/)
  assert.match(html, /<a href="\/care-map\?kind=shelter" class="button-secondary">보호시설 찾기/)
  // 버튼 폭은 계약을 우회하지 않고 감싸는 칸으로 정한다.
  for (const file of [
    'src/shared/ui/TicketActionCard.tsx',
    'src/widgets/care-map-entry/ui/CareMapEntry.tsx',
    'src/widgets/feature-highlights/ui/FeatureHighlights.tsx',
  ])
    assert.doesNotMatch(source(file), /cn\(buttonVariants/, file)
})

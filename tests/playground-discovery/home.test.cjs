const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/discovery.fixture.cjs')

const ui = 'src/features/playground-tools/ui'

test('놀이터 첫 화면은 사진, 방, 놀이, 돌봄 도구 순으로 놓이고 병원 기록은 돌봄 도구에만 있음', () => {
  const home = source('src/app/(main)/playground/_ui/PlaygroundContent.tsx')
  const order = [
    'headingId="playground-ai"',
    '<PetEntryCard />',
    '<PlaygroundPlayShelf />',
    '<PlaygroundCareShelf />',
  ].map((marker) => home.indexOf(marker))
  assert.ok(order.every((index) => index > 0))
  assert.deepEqual(
    [...order].sort((a, b) => a - b),
    order,
  )
  assert.doesNotMatch(source(`${ui}/PlaygroundPlayShelf.tsx`), /clinic|병원/)
  assert.match(source(`${ui}/PlaygroundCareShelf.tsx`), /experience=clinic/)
})

test('돌봄 도구 카드는 같은 줄에서 높이를 맞추고 산책 공유는 위치 공개 범위를 먼저 알림', () => {
  const care = source(`${ui}/PlaygroundCareShelf.tsx`)
  // 높이 맞춤은 공통 티켓 링크가 맡는다.
  assert.match(care, /<TicketLink\b/)
  assert.match(source('src/shared/ui/Ticket.tsx'), /flex h-full flex-col/)
  assert.match(care, /확인한 장소만 공개/)
  assert.match(care, /href: '\/playground\/outing'/)
})

test('사진·반려동물 소개는 같은 쇼케이스 틀을 쓰고 돌봄 도구는 놀이 카드와 같은 티켓을 씀', () => {
  const home = source('src/app/(main)/playground/_ui/PlaygroundContent.tsx')
  const pet = source('src/features/playground-pet/ui/PetEntryCard.tsx')
  for (const file of [home, pet]) {
    assert.match(file, /<FeatureShowcase\b/)
    assert.match(file, /<FeatureShowcaseTiles\b/)
    assert.match(file, /steps=\{/)
  }
  assert.match(home, /label="AI PHOTO"/)
  assert.match(pet, /label="MY PET"[\s\S]*?accent="peach"/)
  // 놀이 카드와 돌봄 도구는 같은 공통 티켓 링크를 쓴다.
  for (const file of ['PlaygroundCareShelf.tsx', 'PlaygroundPlayShelf.tsx'])
    assert.match(source(`${ui}/${file}`), /<TicketLink\b/, file)
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
    './Ticket.module.css': {
      default: { ticket: 'ticket', strip: 'strip', stub: 'stub', stubNumber: 'num' },
    },
  })
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
  assert.match(html, /^<section aria-labelledby="demo" data-accent="peach" class="ticket">/)
  assert.match(html, /<span class="strip"><span>AI PHOTO<\/span><\/span>/)
  assert.match(html, /<p class="[^"]*text-primary-600">사진으로 노는 시간<\/p><h2 id="demo"/)
  assert.match(html, /<ol class="stub [^"]*"><li[^>]*><span class="num">1<\/span>고르기<\/li>/)
  // 놀이 카드 셋은 노트북부터 한 줄에 놓이고 태블릿에서는 마지막 카드가 혼자 남지 않는다.
  const shelf = source('src/features/playground-tools/ui/PlaygroundPlayShelf.tsx')
  assert.match(shelf, /tab:grid-cols-2 lap:grid-cols-3/)
  assert.match(shelf, /tab:last:odd:col-span-2 lap:last:odd:col-span-1/)
})

test('놀이터 아래 돌봄 지도 카드도 초록 CARE MAP 티켓에 버튼 두 개를 둠', () => {
  const cn = (...values) => values.filter(Boolean).join(' ')
  const { CareMapEntry } = loadTypescript('src/widgets/care-map-entry/ui/CareMapEntry.tsx', {
    'next/link': { __esModule: true, default: (props) => createElement('a', props) },
    '@/shared/assets': { LocationPinIcon: () => null, PixelArrowRightIcon: () => null },
    '@/shared/lib/cn': { cn },
    '@/shared/ui': { Container: ({ children }) => createElement('div', {}, children) },
    '@/shared/ui/Button': { buttonVariants: ({ intent }) => `button-${intent}` },
    '@/shared/ui/Ticket': {
      ticketStyles: { ticket: 'ticket' },
      TicketStrip: ({ label }) => createElement('span', { className: 'strip' }, label),
    },
    './CareMapEntry.module.css': { default: {} },
  })
  const html = renderToStaticMarkup(createElement(CareMapEntry, { embedded: true }))
  assert.match(
    html,
    /^<section aria-label="우리 동네 돌봄 지도" data-accent="green" class="ticket"><span class="strip">CARE MAP<\/span>/,
  )
  assert.match(html, /<a href="\/care-map" class="button-primary">동물병원 찾기/)
  assert.match(html, /<a href="\/care-map\?kind=shelter" class="button-secondary">보호시설 찾기/)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/discovery.fixture.cjs')

const ui = 'src/features/playground-tools/ui'

test('놀이터 첫 화면은 놀이, 사진, 방, 돌봄 도구 순으로 놓이고 병원 기록은 돌봄 도구에만 있음', () => {
  const home = source('src/app/(main)/playground/_ui/PlaygroundContent.tsx')
  const order = [
    '<PlaygroundPlayShelf />',
    'headingId="playground-ai"',
    '<PetEntryCard />',
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

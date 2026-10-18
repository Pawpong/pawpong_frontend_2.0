const { test } = require('node:test')
const assert = require('node:assert/strict')
const { model, allCards, source } = require('./fixtures/discovery.fixture.cjs')

test('추억 카드 주소에는 카드 식별자만 싣고 문구는 고정 목록에서 다시 찾음', () => {
  for (const card of allCards()) {
    const href = model.memoryCardHref(card)
    const url = new URL(href, 'https://example.test')
    assert.equal(url.pathname, '/playground/memory-card')
    assert.deepEqual([...url.searchParams.keys()], ['play'])
    const seed = model.memoryCardSeed(url.searchParams.get('play'))
    assert.equal(seed.message, card.memoryMessage)
    assert.equal(seed.title, card.title)
    assert.ok(['butter', 'mint', 'lavender'].includes(seed.theme))
  }
})

test('목록에 없거나 조작된 놀이 식별자는 추억 카드에 아무것도 채우지 않음', () => {
  for (const id of [
    null,
    undefined,
    '',
    '__proto__',
    'constructor',
    'toString',
    'a'.repeat(41),
    '<script>',
    'sunlight-collector ',
    42,
  ])
    assert.equal(model.memoryCardSeed(id), null)
})

test('카드 색은 추억 카드 테마로 정해진 규칙대로 옮겨짐', () => {
  assert.equal(model.memoryCardSeed('sunlight-collector').theme, 'butter')
  assert.equal(model.memoryCardSeed('sound-explorer').theme, 'mint')
  assert.equal(model.memoryCardSeed('neighborhood-photographer').theme, 'lavender')
  assert.equal(model.memoryCardSeed('shadow-studio').theme, 'butter')
})

test('추억 카드는 화면 이동 직후에도 주소의 놀이 식별자를 라우터에서 읽어 문구를 채움', () => {
  const code = source('src/features/playground-tools/ui/MemoryCard.tsx')
  assert.match(code, /useSearchParams\(\)\.get\('play'\)/)
  assert.doesNotMatch(code, /window\.location\.search/)
  assert.match(code, /<Suspense fallback=/)
  assert.match(code, /key=\{`\$\{owner\}:\$\{playId \?\? ''\}`\}/)
})

test('로그인하러 가도 확인된 놀이 카드 식별자만 돌아올 주소에 남김', () => {
  const code = source('src/features/playground-tools/ui/MemoryCard.tsx')
  assert.match(
    code,
    /seed && playId\s*\?\s*`\/playground\/memory-card\?play=\$\{encodeURIComponent\(playId\)\}`\s*:\s*'\/playground\/memory-card'/,
  )
  assert.doesNotMatch(code, /returnUrl=%2Fplayground%2Fmemory-card"/)
})

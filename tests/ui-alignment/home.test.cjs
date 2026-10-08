const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('마이홈 게시글 격자는 375px 시안 폭을 지키면서 360px 이하 폰에서는 열이 줄어 가로로 넘치지 않음', () => {
  const grid = source('src/app/(main)/home/_ui/HomePostGrid.tsx')
  assert.match(grid, /grid-cols-\[repeat\(3,minmax\(0,7\.625rem\)\)\] justify-between gap-x-1/)
  assert.doesNotMatch(grid, /grid-cols-\[repeat\(3,7\.625rem\)\]/)
})

test('공통 탭 바는 116px 표시선 모양을 유지하되 좁은 폰에서 바 밖으로 나간 부분만 잘라 페이지를 밀지 않음', () => {
  const bar = source('src/shared/ui/TabBar.tsx')
  assert.match(bar, /'overflow-x-clip border-b border-neutral-300 bg-white'/)
  assert.match(bar, /after:w-\[7\.25rem\]/)
})

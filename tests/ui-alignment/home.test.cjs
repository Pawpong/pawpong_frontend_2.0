const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('홈 게시글(마이홈·공개 홈)은 1열 피드 카드 하나로 그리고 폭을 꽉 채워 좁은 폰에서도 가로로 넘치지 않음', () => {
  const grid = source('src/app/(main)/home/_ui/HomePostGrid.tsx')
  assert.match(grid, /const FEED_LIST = 'mx-auto flex w-full max-w-\[40rem\] flex-col/)
  assert.match(grid, /<CommunityProfileFeedCard/)
  // 고정 폭 격자가 남아 있으면 360px 이하 폰에서 가로로 넘친다
  assert.doesNotMatch(grid, /grid-cols-\[repeat\(3/)
})

test('공통 탭 바는 116px 표시선 모양을 유지하되 좁은 폰에서 바 밖으로 나간 부분만 잘라 페이지를 밀지 않음', () => {
  const bar = source('src/shared/ui/TabBar.tsx')
  assert.match(bar, /'frame-bleed overflow-x-clip border-b border-neutral-300 bg-white'/)
  assert.match(source('src/shared/ui/Tabs.tsx'), /after:w-\[7\.25rem\] after:max-w-full/)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('탐색 유형 탭은 sticky 머리와 목록을 함께 감싼 Tabs 안에서 실제 목록 패널을 가리킴', () => {
  const explore = source('src/app/(main)/explore/_ui/ExploreContent.tsx')
  assert.match(explore, /<Tabs\s+value=\{selectedType\}/)
  assert.match(explore, /<TabBarList[\s\S]{0,160}ariaLabel="탐색 유형"/)
  assert.match(explore, /<TabsContent value=\{selectedType\} className="mt-0">/)
  assert.doesNotMatch(explore, /<TabBar\b/)
})

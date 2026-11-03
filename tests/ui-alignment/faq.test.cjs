const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('FAQ 이용자 유형은 목록 필터와 같은 FilterTab 으로 고르고 탭 부품을 쓰지 않음', () => {
  const faq = source('src/app/(main)/(page)/faq/_ui/FaqContent.tsx')
  assert.match(faq, /role="group" aria-label="FAQ 이용자 유형"/)
  assert.match(faq, /<FilterTab\s+key=\{tab\.value\}\s+selected=\{value === tab\.value\}/)
  assert.doesNotMatch(faq, /<Tabs\b|<TabsTrigger|badgeVariants/)
})

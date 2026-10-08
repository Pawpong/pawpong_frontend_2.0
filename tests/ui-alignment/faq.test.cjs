const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('FAQ 이용자 유형 탭은 같은 Tabs 안의 질문 목록 패널을 가리킴', () => {
  const faq = source('src/app/(main)/faq/_ui/FaqContent.tsx')
  assert.match(faq, /<Tabs value=\{audience\} onValueChange=/)
  assert.match(faq, /<TabsContent value=\{audience\} className="mt-7">/)
  // 유형 탭 컴포넌트는 Tabs 루트를 따로 만들지 않는다(패널과 떨어지면 aria-controls가 없는 ID를 가리킴)
  const tabs = faq.slice(faq.indexOf('const FaqAudienceTabs'), faq.indexOf('const FaqContent'))
  assert.doesNotMatch(tabs, /<Tabs\b/)
})

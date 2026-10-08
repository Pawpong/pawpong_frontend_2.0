const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

const ui = 'src/app/(main)/community/_ui'

test('AI 참고 답변 요청은 대비가 보장된 공통 버튼을 씀', () => {
  const answer = source(`${ui}/CommunityAiAnswer.tsx`)
  assert.match(answer, /<Button\s+width="full"\s+disabled=\{!consent \|\| result\.isFetching\}/)
  assert.doesNotMatch(answer, /bg-primary-500 px-4 py-3 text-sm font-bold/)
})

test('재심사 요청과 설정 재확인은 공통 버튼과 재시도 버튼을 씀', () => {
  const panel = source(`${ui}/CommunityPostReviewPanel.tsx`)
  assert.match(panel, /<Button\s+width="full"/)
  assert.match(panel, /<RetryButton\s+aria-label="심사 설정 다시 확인하기"/)
  assert.doesNotMatch(panel, /className="text-xs underline"/)
})

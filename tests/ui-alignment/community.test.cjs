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

test('댓글 수정 입력과 처리 안내는 공통 입력칸과 focus-ring을 씀', () => {
  const form = source('src/app/(main)/community/post/[postId]/_ui/CommentEditForm.tsx')
  assert.match(form, /<Textarea\s+ref=\{field\}\s+aria-label="댓글 수정 내용"/)
  assert.doesNotMatch(form, /<textarea/)
  const feedback = source('src/app/(main)/community/post/[postId]/_ui/CommentActionFeedback.tsx')
  assert.match(feedback, /focus-ring/)
  assert.doesNotMatch(feedback, /focus-visible:ring-2/)
})

test('이야기 찾기의 상세 필터는 공통 버튼이고 빠른 탐색과 선택 조건은 이름 있는 묶음임', () => {
  const discovery = source(`${ui}/CommunityDiscovery.tsx`)
  assert.match(discovery, /<DialogTrigger asChild>\s*<Button intent="secondary" size="md">/)
  assert.match(discovery, /role="group"\s+aria-label="빠른 탐색"/)
  assert.match(
    source(`${ui}/discovery/AppliedFilters.tsx`),
    /role="group"\s+aria-label="선택한 조건"/,
  )
})

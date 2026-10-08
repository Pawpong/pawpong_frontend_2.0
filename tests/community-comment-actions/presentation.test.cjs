const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  load,
  hooks,
  nodes,
  directory,
  fixture,
  comment,
} = require('./fixtures/actions.fixture.cjs')

test('수정 입력은 이름과 길이 제한이 있고 저장 중에는 잠긴다', () => {
  const runtime = hooks()
  const { CommentEditForm } = load(directory + 'CommentEditForm.tsx', {
    react: runtime.react,
    '@/shared/ui': { Button: 'button' },
  })
  let submits = 0
  const actions = {
    active: { mode: 'edit', draft: '입력', intent: {}, comment: comment() },
    isBusy: true,
    submit() {
      submits++
    },
  }
  const tree = nodes(runtime.render(() => CommentEditForm({ actions })))
  const input = tree.find((node) => node.type === 'textarea')
  assert.equal(input.props['aria-label'], '댓글 수정 내용')
  assert.equal(input.props.maxLength, 1000)
  assert.equal(input.props.disabled, true)
  assert.ok(tree.filter((node) => node.type === 'button').every((node) => node.props.disabled))
  tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.equal(submits, 1)
})

test('새로 조회한 댓글이 달라져도 수정 중 초안은 유지하며 현재 내용을 함께 보여준다', () => {
  const runtime = hooks()
  const { CommentEditForm } = load(directory + 'CommentEditForm.tsx', {
    react: runtime.react,
    '@/shared/ui': { Button: 'button' },
  })
  const tree = nodes(
    runtime.render(() =>
      CommentEditForm({
        actions: { active: { mode: 'edit', draft: '내 초안', intent: {}, comment: comment() } },
        currentBody: '다른 기기에서 수정한 내용',
      }),
    ),
  )
  assert.equal(tree.find((node) => node.type === 'textarea').props.value, '내 초안')
  assert.ok(
    tree.some(
      (node) =>
        node.type === 'p' && JSON.stringify(node.props.children).includes('현재 게시된 내용'),
    ),
  )
})

test('삭제 확인창은 실패 안내와 읽기 재확인을 제공하고 조회 중 닫히지 않는다', () => {
  const { DeleteConfirmModal } = load('src/shared/ui/DeleteConfirmModal.tsx', {
    './CtaModal': { CtaModal: 'modal' },
  })
  let closes = 0,
    checks = 0
  const props = {
    open: true,
    target: '댓글',
    onOpenChange: () => closes++,
    onConfirm() {},
    errorMessage: '결과를 확인하지 못했어요',
    onCheck: () => checks++,
  }
  const first = DeleteConfirmModal(props)
  first.props.actions.find((action) => action.label === '목록 다시 확인').onClick()
  assert.equal(checks, 1)
  assert.ok(nodes(first.props.description).some((node) => node.props?.role === 'alert'))
  const pending = DeleteConfirmModal({ ...props, isChecking: true })
  pending.props.onOpenChange(false)
  assert.equal(closes, 0)
  assert.ok(pending.props.actions.every((action) => action.disabled))
  assert.ok(nodes(pending.props.description).some((node) => node.props?.role === 'status'))
})

test('목록이 비어도 수정 중 초안을 별도 복구 영역에 남긴다', () => {
  const { CommentList } = load(directory + 'CommentList.tsx', {
    '@/shared/ui': {
      Button: 'button',
      DeleteConfirmModal: 'delete',
      ListState: 'list',
      InfiniteScrollTrigger: 'scroll',
    },
    './CommentItem': { CommentItem: 'comment' },
    './CommentEditForm': { CommentEditForm: 'edit' },
    './CommentActionFeedback': { CommentActionFeedback: 'feedback' },
  })
  const h = fixture()
  h.render().start(comment(), 'edit')
  h.render().setDraft('목록에서 사라져도 보존할 내용')
  const tree = nodes(
    CommentList({ thread: { actions: h.render(), threads: [], isPending: false } }),
  )
  assert.equal(
    tree.find((node) => node.type === 'edit').props.actions.active.draft,
    '목록에서 사라져도 보존할 내용',
  )
})

test('서버 오류 원문 대신 현재 작업과 복구 방법만 안내한다', () => {
  const h = fixture()
  assert.doesNotMatch(
    h.model.commentActionFeedback(new h.ApiError('내부 합성 오류 상세', 500), 'edit'),
    /내부 합성 오류/,
  )
  assert.match(
    h.model.commentActionFeedback(new h.AuthWriteRetryRequiredError(), 'delete'),
    /다시 삭제/,
  )
})

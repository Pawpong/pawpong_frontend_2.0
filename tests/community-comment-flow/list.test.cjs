const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const { nodes } = require('../fixtures/react-hooks.fixture.cjs')
const { buildCommentTree } = load('src/app/(main)/community/post/[postId]/_ui/commentThread.ts')
const { CommentList } = load('src/app/(main)/community/post/[postId]/_ui/CommentList.tsx', {
  '@/shared/ui': {
    Button: 'button',
    DeleteConfirmModal: 'delete',
    ListState: 'list-state',
    InfiniteScrollTrigger: 'trigger',
  },
  '@/features/gamification': { usePublicActivityBadges: () => [] },
  './CommentItem': { CommentItem: 'comment' },
  './CommentEditForm': { CommentEditForm: 'edit' },
  './CommentActionFeedback': { CommentActionFeedback: 'feedback' },
})
const idleActions = { active: null, notice: null, isBusy: false, isChecking: false }

test('첫 댓글 목록 오류에서 같은 화면의 조회 재시도를 연결한다', () => {
  let reads = 0
  const tree = nodes(
    CommentList({
      thread: {
        actions: idleActions,
        threads: [],
        isError: true,
        refetch: () => reads++,
        isFetching: false,
      },
    }),
  )
  tree.find((x) => x.type === 'list-state').props.onRetry()
  assert.equal(reads, 1)
  assert.equal(tree.find((x) => x.type === 'trigger').props.hasNextPage, false)
})

test('다음 페이지 오류는 기존 댓글을 유지하고 실패한 페이지만 재시도한다', () => {
  let nextReads = 0,
    allReads = 0
  const tree = nodes(
    CommentList({
      thread: {
        actions: idleActions,
        threads: [{ parentId: '원문', root: { commentId: '원문' }, replies: [] }],
        isError: true,
        isFetchNextPageError: true,
        hasNextPage: true,
        fetchNextPage: () => nextReads++,
        refetch: () => allReads++,
      },
    }),
  )
  assert.equal(tree.filter((x) => x.type === 'comment').length, 1)
  assert.equal(tree.find((x) => x.type === 'trigger').props.hasNextPage, false)
  tree.find((x) => x.type === 'button').props.onClick()
  assert.equal(nextReads, 1)
  assert.equal(allReads, 0)
})

test('전송 중 모든 답글 버튼을 잠그고 삭제된 원문의 답글은 유지한다', () => {
  const { threads } = buildCommentTree([
    { commentId: '원문', createdAt: '2026-10-08' },
    { commentId: '답글', parentCommentId: '삭제된 원문', createdAt: '2026-10-09' },
  ])
  const tree = nodes(
    CommentList({
      thread: { actions: idleActions, threads, isSubmitting: true, handleReply() {} },
    }),
  )
  const comments = tree.filter((x) => x.type === 'comment')
  assert.equal(comments.length, 2)
  assert.ok(comments.every((x) => x.props.replyDisabled === true))
  assert.equal(comments[1].props.onReply, undefined)
})

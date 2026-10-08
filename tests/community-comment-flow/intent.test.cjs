const { test } = require('node:test')
const assert = require('node:assert/strict')
const { threadFixture, token, deferred } = require('./fixtures/thread.fixture.cjs')

test('대상이 사라진 답글을 일반 댓글로 바꾸어 전송하지 않는다', async () => {
  const h = threadFixture()
  h.render().handleReply(h.input.comments[0])
  h.input.comments = []
  await assert.rejects(h.render().handleSubmitComment('입력한 답글'), /답글 대상/)
  assert.equal(h.input.writes.length, 0)
  assert.equal(h.render().replyTarget.commentId, '첫 댓글')
})

test('전송 중에는 답글 대상을 바꾸거나 취소하지 않는다', async () => {
  const pending = deferred()
  const h = threadFixture(() => pending.promise)
  h.render().handleReply(h.input.comments[0])
  const sending = h.render().handleSubmitComment('입력한 답글')
  h.render().handleReply(h.input.comments[1])
  assert.equal(h.render().replyTarget.commentId, '첫 댓글')
  h.render().cancelReply()
  assert.equal(h.render().replyTarget.commentId, '첫 댓글')
  pending.resolve()
  await sending
  assert.equal(h.render().replyTarget, null)
})

test('다른 계정과 게시글에는 이전 답글 대상을 넘기지 않는다', () => {
  const h = threadFixture()
  h.render().handleReply(h.input.comments[0])
  const previous = h.render().composerKey
  h.state.token = token('account-b')
  assert.equal(h.render().replyTarget, null)
  assert.notEqual(h.render().composerKey, previous)
  h.state.token = token('account-a')
  h.input.postId = '다른 질문'
  assert.equal(h.render().replyTarget, null)
})

test('같은 계정 토큰 갱신은 작성 중인 답글 대상을 유지한다', () => {
  const h = threadFixture()
  h.render().handleReply(h.input.comments[0])
  const previous = h.render().composerKey
  h.state.token = token('account-a', 2)
  assert.equal(h.render().composerKey, previous)
  assert.equal(h.render().replyTarget.commentId, '첫 댓글')
})

test('목록 조회 실패 시 입력한 답글을 전송하지 않고 재확인을 요구한다', async () => {
  const h = threadFixture()
  h.render().handleReply(h.input.comments[0])
  h.input.query.isError = true
  await assert.rejects(h.render().handleSubmitComment('입력한 답글'), /댓글 목록/)
  assert.equal(h.input.writes.length, 0)
})

test('실패 후 답글 대상을 유지하고 명시적 취소 후에만 일반 댓글을 작성한다', async () => {
  const h = threadFixture()
  h.render().handleReply(h.input.comments[0])
  h.input.comments = []
  await assert.rejects(h.render().handleSubmitComment('답글'))
  h.render().cancelReply()
  await h.render().handleSubmitComment('답글')
  assert.deepEqual(h.input.writes, [{ body: '답글', parentCommentId: undefined }])
})

test('다른 게시글로 이동한 뒤 이전 완료가 새 답글 대상을 지우지 않는다', async () => {
  const pending = deferred()
  const h = threadFixture(() => pending.promise)
  h.render().handleReply(h.input.comments[0])
  const sending = h.render().handleSubmitComment('이전 글 답글')
  h.input.postId = '다른 게시글'
  h.render().handleReply(h.input.comments[1])
  pending.resolve()
  await assert.rejects(sending)
  assert.equal(h.render().replyTarget.commentId, '두 번째 댓글')
})

test('게시글 재조회로 입력창이 숨겨져도 같은 계정의 초안을 유지한다', () => {
  const h = threadFixture()
  h.render().setCommentBody('보존할 댓글')
  h.input.enabled = false
  assert.equal(h.render().commentBody, '보존할 댓글')
  h.input.enabled = true
  assert.equal(h.render().commentBody, '보존할 댓글')
})

test('이전 계정과 게시글의 입력 콜백은 새 초안을 지우지 않는다', () => {
  const h = threadFixture()
  const previous = h.render()
  previous.setCommentBody('이전 계정 입력')
  h.state.token = token('account-b')
  assert.equal(h.render().commentBody, '')
  h.render().setCommentBody('새 계정 입력')
  previous.setCommentBody('')
  assert.equal(h.render().commentBody, '새 계정 입력')
  const other = h.render()
  h.input.postId = '다른 글'
  h.render().setCommentBody('다른 글 입력')
  other.setCommentBody('')
  assert.equal(h.render().commentBody, '다른 글 입력')
})

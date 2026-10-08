const { test } = require('node:test')
const assert = require('node:assert/strict')
const { threadFixture, token, deferred } = require('./fixtures/thread.fixture.cjs')
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i

test('응답 유실 후 같은 댓글을 다시 게시하면 같은 작성 식별자를 보낸다', async () => {
  const h = threadFixture(async () => {
    throw new Error('합성 응답 유실')
  })
  await assert.rejects(h.render().handleSubmitComment('같은 댓글'))
  await assert.rejects(h.render().handleSubmitComment('같은 댓글'))
  assert.match(h.input.writes[0].clientRequestId, uuid)
  assert.equal(h.input.writes[0].clientRequestId, h.input.writes[1].clientRequestId)
})

test('같은 계정 인증 갱신은 댓글 시도를 유지하되 다른 계정에는 새 식별자를 사용한다', async () => {
  const h = threadFixture(async () => {
    throw new Error('합성 인증 만료')
  })
  await assert.rejects(h.render().handleSubmitComment('같은 댓글'))
  h.state.token = token('account-a', 2)
  await assert.rejects(h.render().handleSubmitComment('같은 댓글'))
  assert.equal(h.input.writes[0].clientRequestId, h.input.writes[1].clientRequestId)
  h.state.token = token('account-b')
  await assert.rejects(h.render().handleSubmitComment('같은 댓글'))
  assert.notEqual(h.input.writes[1].clientRequestId, h.input.writes[2].clientRequestId)
})

test('본문과 답글 대상 또는 게시글이 바뀌면 새로운 작성 의도로 구분한다', async () => {
  const h = threadFixture(async () => {
    throw new Error('합성 응답 유실')
  })
  await assert.rejects(h.render().handleSubmitComment('첫 댓글'))
  await assert.rejects(h.render().handleSubmitComment('바뀐 댓글'))
  h.render().handleReply(h.input.comments[0])
  await assert.rejects(h.render().handleSubmitComment('바뀐 댓글'))
  h.input.postId = '다른 글'
  await assert.rejects(h.render().handleSubmitComment('바뀐 댓글'))
  assert.equal(new Set(h.input.writes.map((write) => write.clientRequestId)).size, 4)
})

test('등록 성공 뒤 같은 본문을 새로 작성하는 것은 별도 댓글로 처리한다', async () => {
  const h = threadFixture()
  await h.render().handleSubmitComment('감사합니다')
  await h.render().handleSubmitComment('감사합니다')
  assert.notEqual(h.input.writes[0].clientRequestId, h.input.writes[1].clientRequestId)
})

test('이전 게시글의 늦은 성공은 새 게시글에서 실패한 시도 식별자를 지우지 않는다', async () => {
  const pending = deferred()
  let writes = 0
  const h = threadFixture(() =>
    ++writes === 1 ? pending.promise : Promise.reject(new Error('합성 실패')),
  )
  const old = h.render().handleSubmitComment('댓글')
  h.input.postId = '다른 글'
  await assert.rejects(h.render().handleSubmitComment('댓글'))
  pending.resolve()
  await assert.rejects(old)
  await assert.rejects(h.render().handleSubmitComment('댓글'))
  assert.equal(h.input.writes[1].clientRequestId, h.input.writes[2].clientRequestId)
})

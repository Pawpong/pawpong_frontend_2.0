const { test } = require('node:test')
const assert = require('node:assert/strict')
const { fixture, comment, token, deferred } = require('./fixtures/actions.fixture.cjs')

test('소유 계정과 역할이 모두 일치하는 댓글만 수정하거나 삭제한다', () => {
  const h = fixture()
  assert.equal(h.render().canManage(comment()), true)
  for (const target of [
    comment('댓글', 'other'),
    { ...comment(), authorModel: 'Breeder' },
    { ...comment(), postId: '다른 글' },
  ]) {
    h.render().start(target, 'edit')
    assert.equal(h.render().active, null)
  }
})

test('계정 전환 뒤 이전 입력과 수정창을 숨기고 오래된 저장 콜백을 무시한다', async () => {
  const h = fixture()
  h.render().start(comment(), 'edit')
  h.render().setDraft('이전 계정 입력')
  const previous = h.render()
  h.state.token = token('account-b')
  assert.equal(h.render().active, null)
  await previous.submit()
  previous.setDraft('오래된 입력')
  assert.equal(h.input.writes.length, 0)
  assert.equal(h.render().active, null)
})

test('정상 토큰 갱신과 화면 조회 중에는 수정 중인 내용을 유지한다', () => {
  const h = fixture()
  h.render().start(comment(), 'edit')
  h.render().setDraft('보존할 수정 내용')
  h.state.token = token('account-a', 2)
  h.input.enabled = false
  assert.equal(h.render().active.draft, '보존할 수정 내용')
  h.input.enabled = true
  assert.equal(h.render().active.draft, '보존할 수정 내용')
})

test('저장 중에는 입력 변경과 취소 및 중복 클릭을 막는다', async () => {
  const pending = deferred(),
    h = fixture({ write: () => pending.promise })
  h.render().start(comment(), 'edit')
  h.render().setDraft('저장할 내용')
  const sending = h.render().submit()
  h.render().setDraft('저장 도중 다른 입력')
  h.render().cancel()
  await h.render().submit()
  assert.equal(h.render().active.draft, '저장할 내용')
  assert.equal(h.input.writes.length, 1)
  pending.resolve()
  await sending
  assert.equal(h.render().active, null)
  assert.match(h.render().notice.message, /수정했어요/)
})

test('새 수정 의도가 열리면 이전 입력과 저장 및 취소 핸들러는 동작하지 않는다', async () => {
  const h = fixture()
  h.render().start(comment(), 'edit')
  const old = h.render()
  h.render().cancel()
  h.render().start(comment('새 댓글'), 'edit')
  h.render().setDraft('새 댓글 입력')
  old.setDraft('이전 콜백')
  old.cancel()
  await old.submit()
  assert.equal(h.render().active.comment.commentId, '새 댓글')
  assert.equal(h.render().active.draft, '새 댓글 입력')
  assert.equal(h.input.writes.length, 0)
})

test('다른 게시글의 새 수정창은 이전 저장 완료로 닫히지 않는다', async () => {
  const pending = deferred(),
    h = fixture({ write: () => pending.promise })
  h.render().start(comment(), 'edit')
  const old = h.render().submit()
  h.input.postId = '새 글'
  h.render().start({ ...comment('새 댓글'), postId: '새 글' }, 'edit')
  pending.resolve()
  await old
  assert.equal(h.render().active.comment.commentId, '새 댓글')
  assert.equal(h.render().notice, null)
})

test('최신 공개 상태가 비활성이 되면 이전 저장 핸들러도 실행하지 않는다', async () => {
  const h = fixture()
  h.render().start(comment(), 'edit')
  const old = h.render()
  h.input.enabled = false
  h.render()
  await old.submit()
  assert.equal(h.input.writes.length, 0)
})

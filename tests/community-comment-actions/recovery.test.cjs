const { test } = require('node:test')
const assert = require('node:assert/strict')
const { fixture, comment, token, deferred } = require('./fixtures/actions.fixture.cjs')

test('응답을 놓친 수정은 입력을 보존하고 읽기로 반영 여부를 확인한다', async () => {
  const h = fixture({
    write: async () => {
      throw new Error('합성 응답 유실')
    },
  })
  h.render().start(comment(), 'edit')
  h.render().setDraft('이미 저장된 내용')
  await h.render().submit()
  assert.equal(h.render().active.draft, '이미 저장된 내용')
  assert.match(h.render().active.error, /저장 여부를 확인하지 못했어요/)
  h.input.comments = [{ ...comment(), body: '이미 저장된 내용' }]
  await h.render().recheck()
  assert.equal(h.input.writes.length, 1)
  assert.equal(h.input.reads, 1)
  assert.equal(h.input.refreshes, 1)
  assert.equal(h.render().active, null)
  assert.match(h.render().notice.message, /반영되어 있어요/)
})

test('삭제 실패를 표시하고 목록 확인은 삭제 요청을 다시 보내지 않는다', async () => {
  const h = fixture({
    write: async () => {
      throw new Error('합성 응답 유실')
    },
  })
  h.render().start(comment(), 'delete')
  await h.render().submit()
  assert.match(h.render().active.error, /삭제 여부를 확인하지 못했어요/)
  await h.render().recheck()
  assert.equal(h.input.writes.length, 1)
  assert.equal(h.render().active.mode, 'delete')
  h.input.comments = []
  await h.render().recheck()
  assert.equal(h.render().active, null)
  assert.match(h.render().notice.message, /현재 불러온 목록/)
  assert.doesNotMatch(h.render().notice.message, /삭제했어요/)
})

test('조회에 실패해도 입력을 유지하고 명시적 조회 재시도로 복구한다', async () => {
  let fails = true
  const h = fixture({
    read: async () => {
      if (fails) throw new Error('합성 조회 실패')
      return [comment()]
    },
  })
  h.render().start(comment(), 'edit')
  h.render().setDraft('아직 저장하지 않은 입력')
  await h.render().recheck()
  assert.match(h.render().active.error, /목록을 확인하지 못했어요/)
  fails = false
  await h.render().recheck()
  assert.equal(h.render().active.draft, '아직 저장하지 않은 입력')
  assert.equal(h.input.writes.length, 0)
})

test('수정 대상이 목록에 없어도 삭제로 단정하거나 초안을 지우지 않는다', async () => {
  const h = fixture()
  h.render().start(comment(), 'edit')
  h.render().setDraft('보관할 초안')
  h.input.comments = []
  await h.render().recheck()
  assert.equal(h.render().active.draft, '보관할 초안')
  assert.match(h.render().active.error, /입력한 내용은 유지돼요/)
})

test('계정 전환과 이탈 뒤 늦게 도착한 조회는 새 화면을 바꾸지 않는다', async () => {
  for (const leave of [false, true]) {
    const pending = deferred(),
      h = fixture({ read: () => pending.promise })
    h.render().start(comment(), 'delete')
    const checking = h.render().recheck()
    if (leave) h.close()
    else {
      h.state.token = token('account-b')
      h.render()
    }
    pending.resolve([])
    await checking
    assert.equal(h.input.refreshes, 0)
  }
})

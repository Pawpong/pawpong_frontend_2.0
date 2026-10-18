const { test } = require('node:test')
const assert = require('node:assert/strict')
const { deferred, token } = require('./fixtures/api.fixture.cjs')
const { answerHookFixture, answer, flush } = require('./fixtures/hook.fixture.cjs')

test('첫 조회는 읽기만 실행하고 동의 없는 생성 요청은 막는다', async (t) => {
  const h = answerHookFixture()
  t.after(h.close)
  h.render()
  await flush()
  await h.render().request()
  assert.equal(h.calls.reads, 1)
  assert.equal(h.calls.writes, 0)
})

test('동시에 두 번 눌러도 생성은 한 번만 전송하고 동의를 소비한다', async (t) => {
  const pending = deferred()
  const h = answerHookFixture({ write: () => pending.promise })
  t.after(h.close)
  const ready = await h.ready()
  const first = ready.request()
  await ready.request()
  await flush()
  assert.equal(h.calls.writes, 1)
  assert.equal(h.render().consent, false)
  assert.equal(h.render().phase, 'requesting')
  pending.resolve(answer())
  await first
  assert.equal(h.render().result.data.status, 'completed')
})

test('응답이 유실되면 생성은 반복하지 않고 기존 답변만 조회한다', async (t) => {
  let reads = 0
  const h = answerHookFixture({
    read: async () => (++reads === 1 ? null : answer('pending')),
    write: async () => {
      throw new Error('응답 유실')
    },
  })
  t.after(h.close)
  await (await h.ready()).request()
  assert.equal(h.calls.writes, 1)
  assert.equal(h.calls.reads, 2)
  assert.equal(h.render().result.data.status, 'pending')
  assert.equal(h.render().message, null)
})

test('접수 확인까지 실패하면 새 생성은 막고 읽기 재확인으로 복구한다', async (t) => {
  let reads = 0
  const h = answerHookFixture({
    read: async () => {
      reads++
      if (reads === 2) throw new Error('조회 실패')
      return reads === 1 ? null : answer()
    },
    write: async () => {
      throw new Error('응답 유실')
    },
  })
  t.after(h.close)
  await (await h.ready()).request()
  assert.equal(h.render().result.isError, true)
  h.render().setConsent(true)
  await h.render().request()
  assert.equal(h.calls.writes, 1)
  await h.render().recheck()
  assert.equal(h.render().result.data.status, 'completed')
  assert.equal(h.calls.writes, 1)
})

test('동의 후에도 화면 이탈 시 요청을 취소하고 늦은 결과는 저장하지 않는다', async (t) => {
  const pending = deferred()
  const h = answerHookFixture({ write: () => pending.promise })
  t.after(h.close)
  const result = (await h.ready()).request()
  await flush()
  h.unmount()
  assert.equal(h.calls.writeSignal.aborted, true)
  pending.resolve(answer())
  await result
  assert.equal(h.client.getQueryData(['community-ai-answer', h.input.context]), null)
})

test('계정 전환 뒤 이전 생성 결과로 캐시를 갱신하지 않는다', async (t) => {
  const pending = deferred()
  const h = answerHookFixture({ write: () => pending.promise })
  t.after(h.close)
  const result = (await h.ready()).request()
  await flush()
  h.state.token = token('다른 보호자')
  pending.resolve(answer())
  await result
  assert.equal(h.client.getQueryData(['community-ai-answer', h.input.context]), null)
})

test('생성 도중 시작된 오래된 조회가 완료 답변을 덮어쓰지 않는다', async (t) => {
  const pendingWrite = deferred(),
    oldRead = deferred()
  const h = answerHookFixture({ write: () => pendingWrite.promise })
  t.after(h.close)
  const result = (await h.ready()).request()
  await flush()
  h.render()
  const stale = h.client
    .fetchQuery({
      queryKey: ['community-ai-answer', h.input.context],
      queryFn: () => oldRead.promise,
      staleTime: 0,
    })
    .catch(() => null)
  pendingWrite.resolve(answer())
  await result
  oldRead.resolve(null)
  await stale
  assert.equal(h.render().result.data.status, 'completed')
})

test('게시글 좋아요의 낙관적 롤백은 별도 답변 캐시를 되돌리지 않는다', async (t) => {
  const h = answerHookFixture()
  t.after(h.close)
  await h.ready()
  const reactionSnapshot = h.client.getQueriesData({ queryKey: ['community'] })
  await h.render().request()
  reactionSnapshot.forEach(([key, value]) => h.client.setQueryData(key, value))
  assert.equal(h.render().result.data.status, 'completed')
})

test('생성 중 조회가 실패하면 자동 폴링을 멈추고 명시적 조회로 복구한다', async (t) => {
  let failed = false
  const h = answerHookFixture({
    read: async () => {
      if (failed) throw new Error('합성 오류')
      return answer('pending')
    },
  })
  t.after(h.close)
  await h.ready()
  assert.equal(h.interval(), 2000)
  failed = true
  await h.render().recheck()
  assert.equal(h.interval(), false)
  failed = false
  await h.render().recheck()
  assert.equal(h.interval(), 2000)
})

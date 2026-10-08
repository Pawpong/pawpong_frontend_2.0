const {
  test,
  assert,
  ApiError,
  job,
  input,
  deferred,
  flush,
  advance,
  clock,
} = require('./fixtures/core.fixture.cjs')
const { mount } = require('./fixtures/transform.fixture.cjs')

test('인증 오류는 무한 재시도하지 않고 폴링을 중단함', async (t) => {
  clock(t)
  const hook = mount({
    status: () => {
      throw new ApiError('Request failed with status code 401', 401)
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await work
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /로그인.*보관함/)
  assert.equal(hook.calls.status.length, 1)
})

test('초기화는 요청을 취소하고 오래된 접수 응답이 새 작업을 덮어쓰지 못하게 함', async (t) => {
  clock(t)
  const old = deferred()
  let requests = 0
  const hook = mount({
    request: () => (++requests === 1 ? old.promise : job('queued', 'new-job')),
    status: (id) => job('succeeded', id),
  })
  const previous = hook.render().transform(input)
  await flush()
  hook.render().reset()
  assert.equal(hook.calls.request[0][1].signal.aborted, true)
  const recent = hook.render().transform(input)
  await flush()
  old.resolve(job('queued', 'old-job'))
  assert.equal(await previous, null)
  await advance(t)
  assert.equal((await recent).jobId, 'new-job')
  assert.deepEqual(
    hook.calls.status.map(([id]) => id),
    ['new-job'],
  )
})

test('화면 종료는 재시도 대기를 취소하고 추가 요청을 보내지 않음', async (t) => {
  clock(t)
  const hook = mount({
    status: () => {
      throw new ApiError('Network Error')
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  hook.unmount()
  assert.equal(await work, null)
  await advance(t, 60000)
  assert.equal(hook.calls.status.length, 1)
  assert.equal(hook.calls.status[0][1].signal.aborted, true)
})

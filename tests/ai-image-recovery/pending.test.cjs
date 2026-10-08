const {
  test,
  assert,
  ApiError,
  job,
  input,
  flush,
  advance,
  clock,
} = require('./fixtures/core.fixture.cjs')
const { mount } = require('./fixtures/transform.fixture.cjs')

test('네 분 대기는 확인 대기 상태가 되고 재확인은 기존 작업만 조회함', async (t) => {
  clock(t)
  const hook = mount()
  const work = hook.render().transform(input)
  await flush()
  await advance(t, 240000)
  assert.equal(await work, null)
  assert.equal(hook.render().phase, 'pending')
  assert.equal(hook.render().canResume, true)
  assert.doesNotMatch(hook.render().error, /timeout|failed|Network Error/)
  const resumed = hook.render().resume()
  assert.equal(hook.render().resume(), resumed)
  await advance(t)
  assert.equal((await resumed).jobId, 'fixture-job')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.upload.length, 1)
})

test('생성 접수 응답이 유실되면 재요청하지 않고 보관함으로 안내함', async () => {
  const hook = mount({
    request: () => {
      throw new ApiError('timeout of 30000ms exceeded')
    },
  })
  assert.equal(await hook.render().transform(input), null)
  assert.equal(hook.render().phase, 'pending')
  assert.equal(hook.render().canResume, false)
  assert.match(hook.render().error, /접수 여부.*보관함/)
  await hook.render().resume()
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.status.length, 0)
})

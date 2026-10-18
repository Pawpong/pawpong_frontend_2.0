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

test('명시적인 캐릭터 생성에만 목적을 전달하고 결과 사진은 한 번 내려받음', async () => {
  for (const purpose of [undefined, 'pet-sprite-v1']) {
    const hook = mount({ request: () => job('succeeded') })
    const result = await hook
      .render()
      .transform({ ...input, ...(purpose && { generationPurpose: purpose }) })
    assert.equal(hook.calls.request.length, 1)
    assert.deepEqual(hook.calls.request[0][0], {
      filterId: input.filterId,
      inputObjectKey: 'ai-image/source/fixture.png',
      ...(purpose && { generationPurpose: purpose }),
    })
    assert.equal(hook.render().phase, 'done')
    assert.equal(result.jobId, 'fixture-job')
    assert.equal(hook.calls.image.length, 1)
    hook.unmount()
  }
})

test('폴링 시간 초과는 생성 요청을 반복하지 않고 같은 작업을 복구함', async (t) => {
  clock(t)
  let attempts = 0
  const hook = mount({
    status: () => {
      if (++attempts === 1) throw new ApiError('timeout of 30000ms exceeded')
      return job('succeeded')
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  assert.equal(hook.render().phase, 'reconnecting')
  assert.equal(hook.render().isWorking, true)
  assert.equal(hook.render().error, null)
  await advance(t)
  const result = await work
  assert.equal(hook.render().phase, 'done')
  assert.equal(await result.file.text(), 'fixture-result')
  assert.equal(hook.calls.request.length, 1)
  assert.deepEqual(
    hook.calls.status.map(([id]) => id),
    ['fixture-job', 'fixture-job'],
  )
  assert.equal(hook.calls.status[0][1].timeout, 10000)
})

test('연속 클릭은 하나의 업로드와 생성 요청을 공유함', async (t) => {
  clock(t)
  const accepted = deferred()
  const hook = mount({ request: () => accepted.promise })
  const initial = hook.render()
  const first = initial.transform(input),
    second = initial.transform(input)
  assert.equal(first, second)
  await flush()
  assert.equal(hook.calls.upload.length, 1)
  assert.equal(hook.calls.request.length, 1)
  accepted.resolve(job())
  await flush()
  await advance(t)
  await first
})

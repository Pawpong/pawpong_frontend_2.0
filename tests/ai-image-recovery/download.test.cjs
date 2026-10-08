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

test('일시적인 결과 다운로드 실패는 새 생성 없이 완성된 작업만 재조회함', async (t) => {
  clock(t)
  let downloads = 0
  const hook = mount({
    image: () => {
      if (++downloads === 1) throw new ApiError('upstream unavailable', 503)
      return new Blob(['recovered-result'])
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  assert.equal(hook.render().phase, 'reconnecting')
  await advance(t)
  assert.equal(await (await work).file.text(), 'recovered-result')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.image.length, 2)
})

test('다운로드가 오래 중단되어도 횟수 차감 없이 다시 확인하도록 완성 작업을 유지함', async (t) => {
  clock(t)
  let offline = true
  const hook = mount({
    image: () => {
      if (offline) throw new ApiError('Network Error')
      return new Blob(['completed'])
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await advance(t, 120000)
  await work
  assert.equal(hook.render().phase, 'pending')
  assert.match(hook.render().error, /사진은 완성/)
  offline = false
  const result = await hook.render().resume()
  assert.equal(result.jobId, 'fixture-job')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.status.length, 1)
})

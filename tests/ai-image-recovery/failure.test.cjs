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

test('원본 업로드 실패 시 생성을 요청하거나 내부 오류를 노출하지 않음', async () => {
  const hook = mount({
    upload: () => {
      throw new ApiError('Network Error')
    },
  })
  await hook.render().transform(input)
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /연결/)
  assert.doesNotMatch(hook.render().error, /Network Error/)
  assert.equal(hook.calls.request.length, 0)
})

test('동물 분류 거절은 재시도하지 않고 조치 가능한 안내를 유지함', async () => {
  const hook = mount({
    request: () => {
      throw new ApiError('동물이 잘 보이는 사진을 올려 주세요.', 400)
    },
  })
  await hook.render().transform(input)
  assert.equal(hook.render().phase, 'failed')
  assert.equal(hook.render().error, '동물이 잘 보이는 사진을 올려 주세요.')
  assert.equal(hook.render().canResume, false)
  assert.equal(hook.calls.request.length, 1)
})

test('서버에서 실패한 작업을 연결 중단으로 잘못 안내하지 않음', async (t) => {
  clock(t)
  const hook = mount({ status: () => ({ ...job('failed'), errorCode: 'INPUT_DOWNLOAD_FAILED' }) })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await work
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /사진을 읽지 못/)
  assert.equal(hook.calls.image.length, 0)
})

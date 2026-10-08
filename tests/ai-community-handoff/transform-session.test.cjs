const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  transformSessionFixture,
  input,
  deferred,
  token,
} = require('./fixtures/transform-session.fixture.cjs')

test('사진 업로드 중 계정이 바뀌면 생성하지 않고 다음 명시적 작업은 정상 시작함', async () => {
  const pending = deferred()
  const h = transformSessionFixture({ upload: () => pending.promise })
  const request = h.render().transform(input)
  h.state.token = token('account-b')
  pending.resolve({ inputObjectKey: 'ai-image/source/synthetic.png' })
  assert.equal(await request, null)
  assert.equal(h.calls.request.length, 0)
  assert.equal(h.render().phase, 'idle')
  const result = await h.render().transform(input)
  assert.equal(result.session, h.session.getAuthReadSession())
  assert.equal(h.calls.request.length, 1)
})

test('결과 재확인은 계정이 바뀌면 이전 작업을 다시 읽지 않음', async () => {
  const h = transformSessionFixture({
    image: () => {
      throw new h.recovery.AiImagePendingError()
    },
  })
  await h.render().transform(input)
  assert.equal(h.render().canResume, true)
  h.state.token = token('account-b')
  assert.equal(await h.render().resume(), null)
  assert.equal(h.calls.image.length, 1)
  assert.equal(h.calls.request.length, 1)
  assert.equal(h.render().phase, 'idle')
})

test('같은 계정의 인증 갱신 후 결과 재확인은 새 생성 없이 기존 결과만 가져옴', async () => {
  let failed = true
  const h = transformSessionFixture({
    image: () => {
      if (failed) throw new h.recovery.AiImagePendingError()
      return new Blob(['photo'])
    },
  })
  await h.render().transform(input)
  h.state.token = token('account-a', 2)
  failed = false
  assert.equal((await h.render().resume()).jobId, h.job.jobId)
  assert.equal(h.calls.image.length, 2)
  assert.equal(h.calls.request.length, 1)
})

test('폴링 대기 중 계정이 바뀌면 다음 상태 조회도 보내지 않음', async () => {
  const pending = deferred()
  const h = transformSessionFixture({
    request: () => ({ jobId: 'old-job', status: 'processing' }),
    wait: () => pending.promise,
  })
  const request = h.render().transform(input)
  for (let i = 0; i < 10; i++) await Promise.resolve()
  h.state.token = token('account-b')
  pending.resolve()
  assert.equal(await request, null)
  assert.equal(h.calls.status.length, 0)
  assert.equal(h.render().phase, 'idle')
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  transformSessionFixture,
  input,
} = require('../ai-community-handoff/fixtures/transform-session.fixture.cjs')

test('업로드와 생성은 작업 시작 시점의 같은 계정을 명시적으로 전달함', async () => {
  const h = transformSessionFixture()
  const captured = h.session.getAuthReadSession()
  await h.render().transform(input)
  assert.equal(h.calls.upload[0][1].session, captured)
  assert.equal(h.calls.request[0][1].session, captured)
  h.unmount()
})

test('인증 복구 후 직접 재시도 안내를 로그인 만료나 무한 대기로 바꾸지 않음', async () => {
  const h = transformSessionFixture({
    request: () => {
      throw new h.AuthWriteRetryRequiredError()
    },
  })
  await h.render().transform(input)
  assert.equal(h.render().phase, 'failed')
  assert.match(h.render().error, /로그인 정보를 갱신했어요/)
  assert.match(h.render().error, /다시 시작/)
  assert.equal(h.calls.request.length, 1)
  assert.equal(h.calls.status.length, 0)
  h.unmount()
})

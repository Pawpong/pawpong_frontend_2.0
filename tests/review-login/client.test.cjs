const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, policy, credentials, session, setupRoute, setupClient, NextRequest } = require('./fixtures/session.fixture.cjs')

test('클라이언트가 비밀번호를 POST 본문으로만 전달하고 공통 쿠키 저장을 사용함', async () => {
  const app = setupClient(async () => Response.json(session))
  assert.equal(await app.signInReviewAccount(credentials, new AbortController().signal), true)
  assert.equal(app.calls[0][0], '/api/auth/review-login')
  assert.deepEqual(JSON.parse(app.calls[0][1].body), credentials)
  assert.equal(app.calls[0][1].cache, 'no-store')
  assert.equal(app.saved.length, 1)
  assert.equal(app.saved[0].accessToken, session.data.accessToken)
})

test('클라이언트가 취소와 로그아웃 및 대체된 인증의 쿠키 저장을 차단함', async () => {
  for (const invalidate of ['cancel', 'logout', 'new-login']) {
    let resolve
    const app = setupClient(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const controller = new AbortController()
    const result = app.signInReviewAccount(credentials, controller.signal)
    if (invalidate === 'cancel') controller.abort()
    else if (invalidate === 'logout') app.beginLogout()
    else app.beginLogin()
    resolve(Response.json(session))
    assert.equal(await result, false)
    assert.equal(app.saved.length, 0)
  }
})

test('클라이언트가 실패하거나 잘못된 성공 응답으로 쿠키를 저장하지 않음', async () => {
  for (const upstream of [
    async () => Response.json({ message: credentials.password }, { status: 401 }),
    async () => Response.json({ success: true }),
    async () => {
      throw new Error(credentials.password)
    },
  ]) {
    const app = setupClient(upstream)
    await assert.rejects(
      app.signInReviewAccount(credentials, new AbortController().signal),
      (error) => !error.message.includes(credentials.password),
    )
    assert.equal(app.saved.length, 0)
  }
})

test('복귀 주소가 보호된 내부 목적지를 유지하고 외부 이동을 거부함', () => {
  const { normalizeReturnUrl } = load('src/shared/lib/normalizeReturnUrl.ts')
  assert.equal(normalizeReturnUrl('/account/delete'), '/account/delete')
  for (const path of ['//evil.example', 'https://evil.example', '/\\evil.example'])
    assert.equal(normalizeReturnUrl(path), '/')
})

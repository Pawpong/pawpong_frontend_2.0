const { test } = require('node:test')
const assert = require('node:assert/strict')
const { authCookieFixture } = require('../fixtures/auth-cookie.fixture.cjs')
const { load, policy, credentials, session, setupRoute, setupClient, NextRequest } = require('./fixtures/session.fixture.cjs')

test('심사 로그인 실패와 취소가 오프라인 로그아웃을 유지하고 이전 계정 복구를 차단함', async () => {
  for (const outcome of ['offline', 'rejected', 'cancelled']) {
    const controller = new AbortController()
    const app = setupClient(async () => {
      if (outcome === 'offline') throw new Error('offline')
      if (outcome === 'cancelled') {
        controller.abort()
        return Response.json(session)
      }
      return new Response('', { status: 401 })
    })
    app.beginLogout()
    const generation = app.getAuthSessionGeneration()
    const attempt = app.signInReviewAccount(credentials, controller.signal)
    if (outcome === 'cancelled') assert.equal(await attempt, false)
    else await assert.rejects(attempt)
    assert.equal(app.hasPendingLogout(), true)
    assert.equal(app.getAuthSessionGeneration(), generation)
    assert.equal(app.isAuthSessionCurrent(), false)
    assert.equal(app.saved.length, 0)
    const boundary = authCookieFixture({ getAccessToken: () => null }, app)
    const recovery = load(
      'src/shared/lib/authSessionRecovery.ts',
      {
        '@/shared/api/token': { getAccessToken: () => null },
        '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
        './authStateEvents': { notifyAuthStateChanged: () => {} },
        './authSessionLifecycle': app,
        './authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts'),
        './authCookieLock': boundary.lock,
        './authCookieScope': boundary.scope,
        './authFetch': load('src/shared/lib/authFetch.ts'),
      },
      { fetch: async () => assert.fail('must not refresh logged-out account') },
    )
    assert.equal(await recovery.restoreAuthSession(), null)
  }
})

test('새 심사 로그인 시도가 이전 인증 응답을 대체함', async () => {
  const replies = []
  const app = setupClient(() => new Promise((resolve) => replies.push(resolve)))
  const first = app.signInReviewAccount(credentials, new AbortController().signal)
  const second = app.signInReviewAccount(credentials, new AbortController().signal)
  replies[0](Response.json(session))
  assert.equal(await first, false)
  assert.equal(app.saved.length, 0)
  replies[1](Response.json(session))
  assert.equal(await second, true)
  assert.equal(app.saved.length, 1)
})

test('명시적 로그아웃 후에도 검증된 심사 인증 결과는 쿠키를 저장할 수 있음', async () => {
  const app = setupClient(async () => Response.json(session))
  app.beginLogout()
  assert.equal(await app.signInReviewAccount(credentials, new AbortController().signal), true)
  assert.equal(app.saved.length, 1)
})

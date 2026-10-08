const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup } = require('./fixtures/session.fixture.cjs')

test('액세스 쿠키가 만료되면 동시 요청이 하나의 세션 복구를 공유함', async () => {
  const app = setup(() =>
    Response.json({ success: true, data: { accessToken: 'next', refreshToken: 'next-refresh' } }),
  )
  assert.deepEqual(await Promise.all([app.restoreAuthSession(), app.refreshAuthSession()]), [
    'next',
    'next',
  ])
  assert.deepEqual(app.calls, ['/api/auth/refresh', '/api/auth/set-cookie'])
  assert.equal(await app.restoreAuthSession(), 'next')
  assert.equal(app.calls.length, 2)
})

test('통신 및 서버 장애는 기존 세션을 유지하고 재시도를 허용함', async () => {
  for (const response of [
    () => {
      throw new Error('offline')
    },
    () => new Response('', { status: 503 }),
  ]) {
    const app = setup(response)
    app.cookie.set('accessToken', 'existing')
    await assert.rejects(app.refreshAuthSession(), { status: 503 })
    assert.equal(app.cookie.get('accessToken'), 'existing')
    assert.deepEqual(app.calls, ['/api/auth/refresh'])
  }
})

test('응답 본문이 지연되어도 인증 갱신 제한 시간을 유지함', async () => {
  let timeout
  let cleared = false
  const app = setup(
    (_url, { signal }) => ({
      ok: true,
      status: 200,
      json: () =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('body stalled')), { once: true })
        }),
    }),
    new Map(),
    {
      setTimeout: (callback) => {
        timeout = callback
        return 1
      },
      clearTimeout: () => {
        cleared = true
      },
    },
  )
  const result = app.restoreAuthSession()
  await Promise.resolve()
  await Promise.resolve()
  assert.equal(cleared, false)
  timeout()
  await assert.rejects(result, { status: 503 })
  assert.equal(cleared, true)
})

test('확정된 인증 만료는 쿠키를 지우고 익명 복구를 반복하지 않음', async () => {
  const app = setup((url) => new Response('', { status: url.endsWith('refresh') ? 401 : 200 }))
  assert.equal(await app.restoreAuthSession(), null)
  assert.equal(await app.restoreAuthSession(), null)
  assert.deepEqual(app.calls, ['/api/auth/refresh', '/api/auth/clear-cookie'])
})

test('로그아웃은 진행 중 갱신의 쿠키 저장을 차단함', async () => {
  let resolve
  const app = setup(
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  const pending = app.refreshAuthSession()
  app.beginLogout()
  resolve(
    Response.json({ success: true, data: { accessToken: 'late', refreshToken: 'late-refresh' } }),
  )
  await assert.rejects(pending, { status: 401 })
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

test('오프라인 로그아웃은 다시 로그인하거나 쿠키를 지울 때까지 유지함', async () => {
  const app = setup(() => {
    throw new Error('offline')
  })
  app.cookie.set('accessToken', 'old')
  app.beginLogout()
  await app.clearAuthCookies()
  assert.equal(app.cookie.has('accessToken'), false)
  const reopened = setup(() => {
    throw new Error('must not refresh')
  }, app.storage)
  assert.equal(await reopened.restoreAuthSession(), null)
  assert.equal(reopened.calls.length, 0)
  assert.equal(reopened.hasPendingLogout(), true)
  reopened.beginLogin()
  assert.equal(reopened.hasPendingLogout(), false)
})

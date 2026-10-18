const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, policy, credentials, session, setupRoute, setupClient, NextRequest } = require('./fixtures/session.fixture.cjs')

for (const role of ['adopter', 'breeder']) {
  test(`BFF가 백엔드의 ${role} 인증을 유지하고 예상하지 않은 필드를 제거함`, async () => {
    const result = structuredClone(session)
    result.data.user.role = role
    result.data.password = 'never forward'
    result.internal = 'private details'
    const app = setupRoute(async () => Response.json(result))
    const response = await app.POST(
      app.request({ ...credentials, emailAddress: '  REVIEW@EXAMPLE.COM ', role: 'admin' }),
    )
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0')
    assert.equal(response.headers.get('pragma'), 'no-cache')
    assert.equal(response.headers.get('set-cookie'), null)
    const data = await response.json()
    assert.equal(data.data.user.role, role)
    assert.equal(data.data.password, undefined)
    assert.equal(data.internal, undefined)
    const [url, options] = app.calls[0]
    assert.equal(url, 'https://api.pawpong.kr/api/auth/review-login')
    assert.deepEqual(JSON.parse(options.body), credentials)
    assert.equal(options.credentials, 'omit')
    assert.equal(options.redirect, 'error')
    assert.equal(options.cache, 'no-store')
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.headers.Cookie, undefined)
    assert.equal(options.headers['X-Forwarded-For'], undefined)
    assert.ok(options.signal instanceof AbortSignal)
  })
}

test('BFF가 백엔드 호출 전에 다른 출처와 사이트의 요청을 거부함', async () => {
  for (const headers of [
    { origin: 'https://attacker.example' },
    { origin: 'null' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    const app = setupRoute()
    const response = await app.POST(app.request(credentials, headers))
    assert.equal(response.status, 403)
    assert.equal(app.calls.length, 0)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
})

test('BFF가 선택적인 Origin 헤더가 없어도 동일 출처 JSON 요청을 허용함', async () => {
  const app = setupRoute()
  const request = app.request()
  request.headers.delete('origin')
  assert.equal((await app.POST(request)).status, 200)
})

test('BFF가 호출 전에 잘못되거나 과도한 입력과 bcrypt 바이트 초과를 거부함', async () => {
  const bodies = [
    '{',
    null,
    {},
    { ...credentials, emailAddress: 'bad' },
    { ...credentials, password: '' },
    { ...credentials, password: '가'.repeat(25) },
    { ...credentials, padding: 'x'.repeat(5000) },
  ]
  for (const body of bodies) {
    const app = setupRoute()
    assert.equal((await app.POST(app.request(body))).status, 400)
    assert.equal(app.calls.length, 0)
  }
  const app = setupRoute()
  assert.equal(
    (await app.POST(app.request(credentials, { 'content-type': 'text/plain' }))).status,
    400,
  )
  assert.equal(app.calls.length, 0)
  assert.equal(
    policy.reviewLoginRequestSchema.safeParse({ ...credentials, password: '가'.repeat(24) })
      .success,
    true,
  )
})

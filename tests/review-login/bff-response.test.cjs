const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, policy, credentials, session, setupRoute, setupClient, NextRequest } = require('./fixtures/session.fixture.cjs')

for (const status of [400, 401, 429, 503, 500, 302]) {
  test(`BFF가 상위 서버의 ${status} 오류에서 내부 내용과 비밀번호를 노출하지 않음`, async () => {
    const app = setupRoute(async () =>
      Response.json(
        { message: credentials.password, accessToken: 'leaked', database: 'internal' },
        { status },
      ),
    )
    const response = await app.POST(app.request())
    assert.equal(response.status, [400, 401, 429, 503].includes(status) ? status : 502)
    const body = await response.text()
    assert.equal(body.includes(credentials.password), false)
    assert.equal(body.includes('leaked'), false)
    assert.equal(body.includes('internal'), false)
    assert.match(response.headers.get('cache-control'), /no-store/)
  })
}

test('BFF가 토큰이 없거나 지원하지 않는 역할의 성공 응답을 거부함', async () => {
  for (const body of [
    { success: true },
    { ...session, success: false },
    { ...session, data: { ...session.data, user: { ...session.data.user, role: 'admin' } } },
  ]) {
    const app = setupRoute(async () => Response.json(body))
    const response = await app.POST(app.request())
    assert.equal(response.status, 502)
    assert.equal((await response.text()).includes('access-from-backend'), false)
  }
})

test('BFF가 시간 초과와 통신 오류 및 JSON이 아닌 응답에서도 비밀값을 노출하지 않음', async () => {
  for (const upstream of [
    async () => {
      throw new Error(credentials.password)
    },
    async () => new Response('<html>private</html>'),
  ]) {
    const app = setupRoute(upstream)
    const response = await app.POST(app.request())
    assert.equal(response.status, 503)
    assert.equal((await response.text()).includes(credentials.password), false)
  }
})

test('BFF가 요청 취소를 고정된 상위 서버 요청에 전달함', async () => {
  const app = setupRoute(async (_, options) => {
    assert.equal(options.signal.aborted, true)
    throw options.signal.reason
  })
  const controller = new AbortController()
  const request = new NextRequest('https://pawpong.kr/api/auth/review-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    signal: controller.signal,
  })
  controller.abort()
  assert.equal((await app.POST(request)).status, 503)
})

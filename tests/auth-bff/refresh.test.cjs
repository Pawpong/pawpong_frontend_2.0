const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup, tokens, refreshed } = require('./fixtures/route.fixture.cjs')

test('인증 갱신은 현재 HttpOnly 쿠키만 보내고 정상 응답 계약을 유지함', async () => {
  const app = setup('refresh')
  const response = await app.POST(app.request({ refreshToken: 'caller-supplied' }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), refreshed)
  assert.equal(app.calls[0][0], 'https://synthetic.invalid/api/v2/auth/refresh')
  assert.deepEqual(JSON.parse(app.calls[0][1].body), { refreshToken: 'synthetic-refresh' })
  assert.equal(app.calls[0][1].redirect, 'error')
  assert.equal(app.calls[0][1].cache, 'no-store')
  assert.match(response.headers.get('cache-control'), /no-store/)
})

test('갱신 쿠키가 없으면 상위 서버를 호출하지 않고 기존 만료 상태를 반환함', async () => {
  const app = setup('refresh', { refreshToken: null })
  const response = await app.POST(app.request())
  assert.equal(response.status, 401)
  assert.equal(app.calls.length, 0)
  assert.equal(response.headers.getSetCookie().length, 0)
  assert.match(response.headers.get('cache-control'), /no-store/)
})

test('상위 서버 오류의 상태는 보존하되 자격증명과 내부 원문은 노출하지 않음', async () => {
  for (const status of [400, 401, 429, 500, 503]) {
    const app = setup('refresh', {
      upstream: async () =>
        Response.json({ message: 'synthetic-secret-value', stack: 'private-stack' }, { status }),
    })
    const response = await app.POST(app.request())
    assert.equal(response.status, status)
    assert.doesNotMatch(await response.text(), /synthetic-secret-value|private-stack/)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
})

test('잘못된 성공 응답과 추가 필드가 토큰 응답 계약을 벗어나지 못함', async () => {
  for (const body of [
    null,
    {},
    { success: false },
    { success: true, data: {} },
    { ...refreshed, data: { ...tokens, accessToken: [] } },
  ]) {
    const app = setup('refresh', { upstream: async () => Response.json(body) })
    assert.equal((await app.POST(app.request())).status, 502)
  }
  const app = setup('refresh', {
    upstream: async () =>
      Response.json({
        ...refreshed,
        debug: 'private',
        data: { ...refreshed.data, internalToken: 'private' },
      }),
  })
  assert.deepEqual(await (await app.POST(app.request())).json(), refreshed)
})

test('통신 예외를 기록하거나 응답에 포함하지 않고 취소 신호를 전달함', async () => {
  const app = setup('refresh', {
    upstream: async (_url, options) => {
      assert.equal(options.signal.aborted, true)
      throw new Error('synthetic-secret-value')
    },
  })
  const controller = new AbortController()
  const request = app.request()
  Object.defineProperty(request, 'signal', { value: controller.signal })
  controller.abort()
  const response = await app.POST(request)
  assert.equal(response.status, 503)
  assert.doesNotMatch(await response.text(), /synthetic-secret-value/)
  assert.deepEqual(app.logged, [])
})

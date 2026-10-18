const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup, jwt, tokens } = require('./fixtures/route.fixture.cjs')

test('잘못된 JSON과 토큰 타입은 쿠키를 쓰지 않고 거부함', async () => {
  const app = setup('set-cookie')
  for (const body of [
    '{',
    'null',
    [],
    {},
    { ...tokens, accessToken: {} },
    { ...tokens, refreshToken: [] },
    { ...tokens, accessToken: '' },
    { ...tokens, refreshToken: ' '.repeat(5) },
    { ...tokens, accessToken: 'a'.repeat(5000) },
  ]) {
    const response = await app.POST(app.request(body))
    assert.equal(response.status, 400)
    assert.equal(response.headers.getSetCookie().length, 0)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
})

test('토큰 저장은 JSON 본문만 허용하고 큰 본문을 제한함', async () => {
  const app = setup('set-cookie')
  for (const contentType of [
    'text/plain',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ]) {
    assert.equal((await app.POST(app.request(tokens, { 'content-type': contentType }))).status, 400)
  }
  const response = await app.POST(app.request({ ...tokens, padding: 'a'.repeat(15000) }))
  assert.equal(response.status, 400)
  assert.equal(response.headers.getSetCookie().length, 0)
})

test('쿠키의 만료 시각과 역할 및 기존 환경별 Domain 정책을 유지함', async () => {
  const app = setup('set-cookie', { env: 'production' })
  const value = {
    accessToken: jwt({ role: 'breeder', exp: Math.floor(Date.now() / 1000) + 120 }),
    refreshToken: tokens.refreshToken,
  }
  for (const [host, headers, count] of [
    ['dev.pawpong.kr', {}, 3],
    ['pawpong.kr', {}, 6],
    ['internal.vercel.app', { 'x-forwarded-host': 'pawpong.kr' }, 6],
  ]) {
    const response = await app.POST(app.request(value, headers, host))
    const cookies = response.headers.getSetCookie()
    assert.equal(response.status, 200)
    assert.equal(cookies.length, count)
    assert.ok(cookies.some((cookie) => /userRole=breeder/.test(cookie)))
    assert.ok(
      cookies.some(
        (cookie) => /refreshToken=synthetic-refresh/.test(cookie) && /httponly/i.test(cookie),
      ),
    )
    assert.ok(
      cookies
        .filter((cookie) => /accessToken=fixture/.test(cookie))
        .every((cookie) => !/httponly/i.test(cookie)),
    )
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
})

test('잘못된 JWT 표시 메타데이터가 쿠키 저장 예외를 일으키지 않음', async () => {
  const app = setup('set-cookie')
  for (const payload of [null, [], 'text', { role: {}, exp: 'soon' }]) {
    const response = await app.POST(app.request({ ...tokens, accessToken: jwt(payload) }))
    assert.equal(response.status, 200)
    assert.ok(
      response.headers.getSetCookie().some((cookie) => cookie.startsWith('userRole=adopter;')),
    )
  }
})

test('같은 출처 로그아웃은 성공 계약과 쿠키 만료를 유지하고 캐시를 금지함', async () => {
  const app = setup('clear-cookie')
  const response = await app.POST(app.request())
  assert.deepEqual(await response.json(), { ok: true, message: '쿠키가 삭제되었습니다.' })
  assert.equal(response.headers.getSetCookie().length, 6)
  assert.equal(
    response.headers.getSetCookie().filter((cookie) => /Domain=\.pawpong\.kr/.test(cookie)).length,
    3,
  )
  assert.match(response.headers.get('cache-control'), /no-store/)
})

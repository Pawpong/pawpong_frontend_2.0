const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { setup, tokens } = require('./fixtures/route.fixture.cjs')

const lastProviderCookie = (response) =>
  response.headers.getSetCookie().find((cookie) => cookie.startsWith('pawpong_last_provider='))

test('소셜 로그인 토큰과 함께 온 제공자는 1년짜리 최근 사용 쿠키로 심음 (제공자 이름만)', async () => {
  const app = setup('set-cookie', { env: 'production' })
  // dev 는 host-only 인증 쿠키 3개, 운영은 옛 Domain 만료 줄까지 6개 — 그 뒤에 한 줄이 더 붙는다
  for (const [host, authCookieCount] of [
    ['dev.pawpong.kr', 3],
    ['pawpong.kr', 6],
  ]) {
    const response = await app.POST(app.request({ ...tokens, provider: 'kakao' }, {}, host))
    const cookies = response.headers.getSetCookie()
    assert.equal(response.status, 200)
    assert.equal(cookies.length, authCookieCount + 1, host)
    assert.ok(cookies.some((cookie) => cookie.startsWith('accessToken=')))

    const cookie = lastProviderCookie(response)
    assert.match(cookie, /^pawpong_last_provider=kakao;/)
    assert.match(cookie, /Max-Age=31536000/)
    assert.match(cookie, /SameSite=Lax/i)
    assert.match(cookie, /HttpOnly/i)
    assert.match(cookie, /Secure/)
    assert.doesNotMatch(cookie, /Domain=/i)
  }
})

test('제공자가 없거나 모르는 값이면 최근 사용 쿠키 없이 로그인 쿠키만 저장함', async () => {
  const app = setup('set-cookie')
  for (const body of [tokens, { ...tokens, provider: 'local' }, { ...tokens, provider: 123 }]) {
    const response = await app.POST(app.request(body))
    assert.equal(response.status, 200)
    assert.equal(response.headers.getSetCookie().length, 3)
    assert.equal(lastProviderCookie(response), undefined)
  }
})

test('로그아웃은 최근 사용 쿠키를 지우지 않음', async () => {
  const app = setup('clear-cookie')
  const response = await app.POST(app.request({}, {}, 'pawpong.kr'))
  assert.ok(response.headers.getSetCookie().length > 0)
  assert.equal(lastProviderCookie(response), undefined)
  assert.doesNotMatch(
    fs.readFileSync('src/shared/lib/server/authCookies.ts', 'utf8'),
    /pawpong_last_provider/,
  )
})

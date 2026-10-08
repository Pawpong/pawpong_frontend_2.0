const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  createBrowser,
  token,
  response,
  deferred,
  until,
} = require('./fixtures/browser.fixture.cjs')

test('이미 보낸 갱신 쿠키 응답 뒤에 새 계정 로그인을 저장함', async () => {
  const browser = createBrowser(),
    saved = deferred()
  const first = browser.tab((url) =>
    url.endsWith('/refresh') ? response(token('first', 2)) : saved.promise,
  )
  const second = browser.tab()
  const refresh = first.refreshAuthSession()
  const rejected = assert.rejects(refresh, { status: 401 })
  await until(() => browser.requests.some((item) => item.url.endsWith('/set-cookie')))
  const login = second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(browser.requests.filter((item) => item.url.endsWith('/set-cookie')).length, 1)
  saved.resolve(Response.json({ ok: true }))
  await rejected
  assert.equal(await login, true)
  assert.equal(browser.cookies.get('accessToken'), token('second'))
  assert.equal(browser.maxActive(), 1)
})

test('새 로그인 뒤 잠금을 얻은 이전 갱신은 쿠키 저장을 보내지 않음', async () => {
  const browser = createBrowser(),
    reply = deferred()
  const first = browser.tab(() => reply.promise),
    second = browser.tab()
  const pending = first.refreshAuthSession()
  await second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  reply.resolve(response(token('first', 2)))
  await assert.rejects(pending, { status: 401 })
  assert.equal(browser.cookies.get('accessToken'), token('second'))
  assert.equal(browser.requests.filter((item) => item.url.endsWith('/set-cookie')).length, 1)
})

test('같은 계정의 새 로그인도 이전 탭 작업의 세대를 무효화함', async () => {
  const browser = createBrowser(),
    reply = deferred()
  const first = browser.tab(() => reply.promise),
    second = browser.tab()
  const oldGeneration = first.getAuthSessionGeneration()
  const pending = first.refreshAuthSession()
  await second.saveAuthTokens({ accessToken: token('first', 3), refreshToken: 'synthetic' })
  reply.resolve(response(token('first', 2)))
  await assert.rejects(pending, { status: 401 })
  assert.notEqual(first.getAuthSessionGeneration(), oldGeneration)
  assert.equal(browser.cookies.get('accessToken'), token('first', 3))
})

test('로그인 두 번의 늦은 응답보다 마지막 로그인 쿠키가 남음', async () => {
  const browser = createBrowser(),
    saved = deferred()
  const first = browser.tab(() => saved.promise),
    second = browser.tab()
  const old = first.saveAuthTokens({ accessToken: token('old-login'), refreshToken: 'synthetic' })
  await until(() => browser.requests.length === 1)
  const current = second.saveAuthTokens({
    accessToken: token('new-login'),
    refreshToken: 'synthetic',
  })
  saved.resolve(Response.json({ ok: true }))
  assert.equal(await old, false)
  assert.equal(await current, true)
  assert.equal(browser.cookies.get('accessToken'), token('new-login'))
})

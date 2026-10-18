const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createBrowser, token, deferred, until } = require('./fixtures/browser.fixture.cjs')

test('이전 로그아웃 쿠키 삭제 응답이 끝난 뒤 새 로그인을 저장함', async () => {
  const browser = createBrowser(),
    cleared = deferred()
  const first = browser.tab((url) => (url.endsWith('/clear-cookie') ? cleared.promise : undefined))
  const second = browser.tab()
  const old = first.logout()
  const rejected = assert.rejects(old, { status: 401 })
  await until(() => browser.requests.some((item) => item.url.endsWith('/clear-cookie')))
  const current = second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  cleared.resolve(Response.json({ ok: true }))
  await rejected
  assert.equal(await current, true)
  assert.equal(browser.cookies.get('accessToken'), token('second'))
})

test('네이티브 로그아웃 확인 중 새 로그인하면 이전 계정의 정리를 중단함', async () => {
  const browser = createBrowser(),
    native = deferred()
  let started = false
  const first = browser.tab(undefined, () => {
    started = true
    return native.promise
  })
  const second = browser.tab()
  const old = first.logout()
  const rejected = assert.rejects(old, { status: 401 })
  await until(() => started)
  const current = second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  native.resolve()
  await rejected
  assert.equal(await current, true)
  assert.equal(
    browser.requests.some(
      (item) => item.url.endsWith('/logout') || item.url.endsWith('/clear-cookie'),
    ),
    false,
  )
})

test('탈퇴 접수 응답의 쿠키 삭제도 새 로그인 저장보다 먼저 끝남', async () => {
  const browser = createBrowser(),
    accepted = deferred()
  const first = browser.tab(async (url) => {
    if (url !== '/api/account-deletion') return
    await accepted.promise
    browser.cookies.delete('accessToken')
    return Response.json({ success: true, data: browser.status })
  })
  const second = browser.tab()
  let clearedQueries = 0
  const old = first.requestAccountDeletion(() => clearedQueries++)
  const rejected = assert.rejects(old, { status: 401 })
  await until(() => browser.requests.some((item) => item.url === '/api/account-deletion'))
  const current = second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  accepted.resolve()
  await rejected
  assert.equal(await current, true)
  assert.equal(browser.cookies.get('accessToken'), token('second'))
  assert.equal(clearedQueries, 0)
})

test('탈퇴 사전 확인 중 계정이 바뀌면 탈퇴 요청과 푸시 해제를 보내지 않음', async () => {
  const browser = createBrowser(),
    prepared = deferred()
  let nativeCalls = 0
  const first = browser.tab(
    () => prepared.promise,
    async () => nativeCalls++,
  )
  const second = browser.tab()
  const old = first.requestAccountDeletion(() => {})
  const rejected = assert.rejects(old, { status: 401 })
  await until(() => browser.requests.some((item) => item.url.endsWith('/prepare')))
  const current = second.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' })
  prepared.resolve(Response.json({ success: true, prepared: true }))
  await rejected
  assert.equal(await current, true)
  assert.equal(nativeCalls, 0)
  assert.equal(
    browser.requests.some((item) => item.url === '/api/account-deletion'),
    false,
  )
})

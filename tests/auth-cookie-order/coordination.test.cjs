const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createBrowser, token, deferred, until } = require('./fixtures/browser.fixture.cjs')

test('잠금이 없는 구형 환경도 같은 문서의 쿠키 변경을 직렬화함', async () => {
  const browser = createBrowser({ locks: false }),
    saved = deferred()
  let writes = 0
  const tab = browser.tab(() => (++writes === 1 ? saved.promise : undefined))
  const old = tab.saveAuthTokens({ accessToken: token('old'), refreshToken: 'synthetic' })
  await until(() => writes === 1)
  const current = tab.saveAuthTokens({ accessToken: token('current'), refreshToken: 'synthetic' })
  saved.resolve(Response.json({ ok: true }))
  assert.equal(await old, false)
  assert.equal(await current, true)
  assert.equal(browser.cookies.get('accessToken'), token('current'))
})

test('중첩된 쿠키 정리는 같은 잠금을 사용하고 종료된 잠금은 재사용하지 못함', async () => {
  const browser = createBrowser(),
    tab = browser.tab()
  const { withAuthCookieLock } = tab.load('src/shared/lib/authCookieLock.ts')
  let lease
  assert.equal(
    await withAuthCookieLock(async (current) => {
      lease = current
      return withAuthCookieLock(async () => 7, current)
    }),
    7,
  )
  await assert.rejects(withAuthCookieLock(async () => 8, lease))
  assert.equal(browser.maxActive(), 1)
})

test('쿠키 변경 실패 후에도 다음 작업이 잠금을 얻을 수 있음', async () => {
  for (const locks of [true, false]) {
    const browser = createBrowser({ locks }),
      tab = browser.tab()
    const { withAuthCookieLock } = tab.load('src/shared/lib/authCookieLock.ts')
    await assert.rejects(
      withAuthCookieLock(async () => {
        throw new Error('합성 실패')
      }),
    )
    assert.equal(await withAuthCookieLock(async () => '복구'), '복구')
  }
})

test('인증 변경 알림에는 토큰 대신 변경 신호만 저장함', () => {
  const browser = createBrowser(),
    tab = browser.tab()
  const { notifyAuthStateChanged, AUTH_STATE_CHANGED } = tab.load(
    'src/shared/lib/authStateEvents.ts',
  )
  notifyAuthStateChanged()
  assert.equal(tab.notifications(), 1)
  assert.ok(browser.storage.has(AUTH_STATE_CHANGED))
  assert.equal(JSON.stringify([...browser.storage]).includes(token('first')), false)
})

test('쿠키 저장 시간이 초과되면 잠금을 해제하고 다음 로그인은 재시도할 수 있음', async () => {
  let timeout,
    timedOut = false
  const browser = createBrowser({
    timers: {
      setTimeout: (callback) => {
        timeout = callback
        return 1
      },
      clearTimeout() {},
    },
  })
  const tab = browser.tab((_url, { signal }) => {
    if (timedOut) return
    return new Promise((_resolve, reject) =>
      signal.addEventListener(
        'abort',
        () => {
          timedOut = true
          reject(new Error('합성 시간 초과'))
        },
        { once: true },
      ),
    )
  })
  const old = tab.saveAuthTokens({ accessToken: token('first', 2), refreshToken: 'synthetic' })
  await until(() => typeof timeout === 'function')
  timeout()
  assert.equal(await old, false)
  assert.equal(
    await tab.saveAuthTokens({ accessToken: token('second'), refreshToken: 'synthetic' }),
    true,
  )
  assert.equal(browser.cookies.get('accessToken'), token('second'))
})

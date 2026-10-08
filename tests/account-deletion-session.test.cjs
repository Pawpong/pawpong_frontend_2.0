const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', ...Object.keys(globals), code)(
    output,
    (name) => dependencies[name] ?? require(name),
    ...Object.values(globals),
  )
  return output
}

const status = {
  requestId: '8489a5c2-1e57-420e-bb76-2ec48b2c5769',
  status: 'pending',
  requestedAt: '2026-09-24T00:00:00.000Z',
  appleConnectionRemovalRequired: false,
}

function setup({ rejectDeletion = false, loseResponse = false, offlineClear = false } = {}) {
  const storage = new Map()
  const cookie = new Map([['accessToken', 'existing-session']])
  const calls = []
  const window = new EventTarget()
  window.location = { hostname: 'localhost', pathname: '/account/delete' }
  const document = new EventTarget()
  document.visibilityState = 'visible'
  Object.defineProperty(document, 'cookie', {
    set(value) {
      const [name, token] = value.split(';')[0].split('=')
      if (value.includes('max-age=0')) cookie.delete(name)
      else cookie.set(name, token)
    },
  })
  const localStorage = {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  const lifecycle = load('src/shared/lib/authSessionLifecycle.ts', {}, { localStorage })
  const authEvents = {
    AUTH_STATE_CHANGED: 'auth',
    notifyAuthStateChanged: () => window.dispatchEvent(new Event('auth')),
  }
  const fetch = async (url) => {
    calls.push(url)
    if (url.endsWith('/prepare')) return Response.json({ success: true, prepared: true })
    if (url === '/api/account-deletion') {
      assert.equal(cookie.get('accessToken'), 'existing-session', 'deletion needs its auth cookie')
      if (rejectDeletion) return new Response('', { status: 409 })
      if (loseResponse) throw new Error('response lost after acceptance')
      cookie.delete('accessToken') // The successful BFF response expires auth cookies.
      return Response.json({ success: true, data: status })
    }
    if (url.endsWith('/status'))
      return rejectDeletion
        ? new Response('', { status: 404 })
        : Response.json({ success: true, data: status })
    if (url.endsWith('/clear-cookie')) {
      if (offlineClear) throw new Error('offline')
      return Response.json({ ok: true })
    }
    throw new Error(`Unexpected auth recovery request: ${url}`)
  }
  const recovery = load(
    'src/shared/lib/authSessionRecovery.ts',
    {
      '@/shared/api/token': { getAccessToken: () => cookie.get('accessToken') ?? null },
      '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
      './authStateEvents': authEvents,
      './authSessionLifecycle': lifecycle,
      './authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts'),
    },
    { window, document, fetch },
  )
  let cleanup
  const bridge = load(
    'src/shared/lib/SessionRecoveryBridge.tsx',
    {
      react: { useEffect: (effect) => (cleanup = effect()) },
      './authSessionRecovery': recovery,
      './authSessionLifecycle': lifecycle,
    },
    { window, document },
  )
  bridge.SessionRecoveryBridge()
  let releaseNative
  let signalNative
  const nativeStarted = new Promise((resolve) => (signalNative = resolve))
  const client = load(
    'src/features/account-deletion/api/accountDeletion.ts',
    {
      '@/shared/lib/accountDeletion': load('src/shared/lib/accountDeletion.ts'),
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/authSessionRecovery': recovery,
      '@/shared/lib/authStateEvents': authEvents,
      '@/shared/lib/nativePushSession': {
        unregisterNativePushSession: () => {
          signalNative()
          return new Promise((resolve) => (releaseNative = resolve))
        },
      },
    },
    { fetch },
  )
  return {
    ...client,
    ...lifecycle,
    cookie,
    calls,
    nativeStarted,
    releaseNative: () => releaseNative(),
    resume: () => {
      window.dispatchEvent(new Event('pawpong:app-active'))
      document.dispatchEvent(new Event('visibilitychange'))
    },
    cleanup: () => cleanup(),
    reopenLifecycle: () => load('src/shared/lib/authSessionLifecycle.ts', {}, { localStorage }),
  }
}

test('네이티브 탈퇴 확인 대기 중 앱이 복귀해도 보호 요청이 끝날 때까지 인증을 유지함', async () => {
  const app = setup()
  let cacheCleared = false
  const pending = app.requestAccountDeletion(() => (cacheCleared = true))
  await app.nativeStarted
  app.resume()
  await Promise.resolve()
  assert.equal(app.hasPendingLogout(), true)
  assert.equal(app.isAuthSessionCurrent(), false)
  assert.equal(app.calls.includes('/api/auth/clear-cookie'), false)
  assert.equal(app.cookie.get('accessToken'), 'existing-session')
  app.releaseNative()
  assert.deepEqual(await pending, status)
  assert.equal(cacheCleared, true)
  assert.equal(app.cookie.has('accessToken'), false)
  assert.equal(app.hasPendingLogout(), false)
  app.cleanup()
})

test('앱 복귀 후 탈퇴에 실패하면 같은 세션으로 네이티브 푸시를 다시 연결함', async () => {
  const app = setup({ rejectDeletion: true })
  const pending = app.requestAccountDeletion(() => assert.fail('must not clear cache'))
  await app.nativeStarted
  app.resume()
  app.releaseNative()
  await assert.rejects(pending)
  assert.equal(app.cookie.get('accessToken'), 'existing-session')
  assert.equal(app.isAuthSessionCurrent(), true)
  assert.equal(app.hasPendingLogout(), false)
  assert.equal(app.calls.includes('/api/auth/clear-cookie'), false)
  app.cleanup()
})

test('탈퇴 응답 유실과 오프라인 정리 실패 후에도 보이는 인증을 지우고 재접속 시 정리를 재시도함', async () => {
  const app = setup({ loseResponse: true, offlineClear: true })
  const pending = app.requestAccountDeletion(() => {})
  await app.nativeStarted
  app.resume()
  app.releaseNative()
  assert.deepEqual(await pending, status)
  assert.equal(app.cookie.has('accessToken'), false)
  assert.equal(app.hasPendingLogout(), true)
  assert.equal(app.canResumeAuthCookieClear(), true)
  const reopened = app.reopenLifecycle()
  assert.equal(reopened.isAuthSessionCurrent(), false)
  assert.equal(reopened.canResumeAuthCookieClear(), true)
  app.cleanup()
})

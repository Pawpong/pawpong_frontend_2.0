const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { authCookieFixture } = require('../../fixtures/auth-cookie.fixture.cjs')

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
  const boundary = authCookieFixture({ getAccessToken: () => cookie.get('accessToken') ?? null }, lifecycle)
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
      './authCookieLock': boundary.lock,
      './authCookieScope': boundary.scope,
      './authFetch': load('src/shared/lib/authFetch.ts', {}, { fetch }),
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
      './authStateEvents': authEvents,
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
      '@/shared/lib/authCookieLock': boundary.lock,
      '@/shared/lib/authCookieScope': boundary.scope,
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

module.exports = { setup, status }

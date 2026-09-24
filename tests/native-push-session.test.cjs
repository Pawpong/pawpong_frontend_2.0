const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(fs.readFileSync('src/shared/lib/nativePushSession.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const lifecycleSource = ts.transpileModule(
  fs.readFileSync('src/shared/lib/authSessionLifecycle.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText
function setup(native = true) {
  const window = new EventTarget()
  const document = new EventTarget()
  document.visibilityState = 'visible'
  const messages = []
  let token = 'session-a'
  let timeout
  if (native)
    window.ReactNativeWebView = { postMessage: (value) => messages.push(JSON.parse(value)) }
  const lifecycle = {}
  new Function('exports', lifecycleSource)(lifecycle)
  const output = {}
  new Function('exports', 'require', 'window', 'document', 'setTimeout', 'clearTimeout', source)(
    output,
    (name) =>
      name.includes('/token')
        ? { getAccessToken: () => token }
        : name.includes('authSessionLifecycle')
          ? lifecycle
          : { AUTH_STATE_CHANGED: 'auth' },
    window,
    document,
    (callback) => {
      timeout = callback
      return 1
    },
    () => {
      timeout = undefined
    },
  )
  return {
    ...output,
    ...lifecycle,
    window,
    document,
    messages,
    setToken: (value) => {
      token = value
    },
    expire: () => timeout?.(),
  }
}

test('existing login, signup and renewed session bind; lifecycle cleanup removes listeners', () => {
  const app = setup()
  const cleanup = app.subscribeNativePushSession()
  assert.deepEqual(app.messages, [{ type: 'REQUEST_FCM_TOKEN', accessToken: 'session-a' }])
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.length, 1)
  app.setToken('session-b')
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.at(-1).accessToken, 'session-b')
  app.window.dispatchEvent(new Event('pawpong:app-ready'))
  assert.equal(app.messages.length, 3)
  app.setToken(null)
  app.window.dispatchEvent(new Event('auth'))
  assert.deepEqual(app.messages.at(-1), { type: 'UNREGISTER_FCM_TOKEN' })
  cleanup()
  app.setToken('session-c')
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.length, 4)
})

test('logout waits for matching native ACK and suppresses old session rebind', async () => {
  const app = setup()
  const cleanup = app.subscribeNativePushSession()
  let finished = false
  app.beginLogout()
  const promise = app.unregisterNativePushSession().then(() => {
    finished = true
  })
  const unregister = app.messages.at(-1)
  assert.equal(unregister.type, 'UNREGISTER_FCM_TOKEN')
  assert.ok(unregister.requestId)
  assert.equal(unregister.accessToken, undefined)
  app.window.dispatchEvent(
    new MessageEvent('message', {
      data: JSON.stringify({ type: 'FCM_TOKEN_UNREGISTERED', requestId: 'unrelated' }),
    }),
  )
  await Promise.resolve()
  assert.equal(finished, false)
  app.setToken('late-refresh-token')
  app.window.dispatchEvent(new Event('auth'))
  app.window.dispatchEvent(new Event('pawpong:app-ready'))
  assert.equal(app.messages.length, 2)
  app.window.dispatchEvent(
    new MessageEvent('message', {
      data: JSON.stringify({ type: 'FCM_TOKEN_UNREGISTERED', requestId: unregister.requestId }),
    }),
  )
  await promise
  assert.equal(finished, true)
  app.beginLogin()
  app.setToken('new-login')
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.at(-1).accessToken, 'new-login')
  cleanup()
})

test('old app without ACK eventually allows logout and browser has no native work', async () => {
  const app = setup()
  const pending = app.unregisterNativePushSession()
  app.expire()
  await pending
  const browser = setup(false)
  const cleanup = browser.subscribeNativePushSession()
  await browser.unregisterNativePushSession()
  assert.equal(browser.messages.length, 0)
  cleanup()
})

test('cancelled account deletion can rebind the same authenticated token after native unregistration', () => {
  const app = setup()
  const cleanup = app.subscribeNativePushSession()
  app.beginLogout()
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.length, 1)
  app.beginLogin()
  app.window.dispatchEvent(new Event('auth'))
  assert.deepEqual(app.messages.at(-1), { type: 'REQUEST_FCM_TOKEN', accessToken: 'session-a' })
  assert.equal(app.messages.length, 2)
  cleanup()
})

test('logout invalidates refresh generation and waits for in-flight cookie writes', async () => {
  const app = setup()
  const generation = app.getAuthSessionGeneration()
  let completeWrite
  const write = app.trackAuthCookieWrite(
    new Promise((resolve) => {
      completeWrite = resolve
    }),
  )
  app.beginLogout()
  assert.equal(app.isAuthSessionCurrent(generation), false)
  let cleared = false
  const logout = app.waitForAuthCookieWrites().then(() => {
    cleared = true
  })
  await Promise.resolve()
  assert.equal(cleared, false)
  completeWrite()
  await write
  await logout
  assert.equal(cleared, true)
  const nextGeneration = app.beginLogin()
  assert.equal(app.isAuthSessionCurrent(generation), false)
  assert.equal(app.isAuthSessionCurrent(nextGeneration), true)
})

test('failed deletion while hidden rebinds the same token when the app becomes visible', async () => {
  const app = setup()
  const cleanup = app.subscribeNativePushSession()
  app.document.visibilityState = 'hidden'
  app.beginLogout()
  app.window.dispatchEvent(new Event('auth'))
  const pending = app.unregisterNativePushSession()
  const unregister = app.messages.at(-1)
  app.window.dispatchEvent(
    new MessageEvent('message', {
      data: JSON.stringify({ type: 'FCM_TOKEN_UNREGISTERED', requestId: unregister.requestId }),
    }),
  )
  await pending
  app.beginLogin()
  app.window.dispatchEvent(new Event('auth'))
  assert.equal(app.messages.length, 2)
  app.document.visibilityState = 'visible'
  app.document.dispatchEvent(new Event('visibilitychange'))
  assert.deepEqual(app.messages.at(-1), { type: 'REQUEST_FCM_TOKEN', accessToken: 'session-a' })
  assert.equal(app.messages.length, 3)
  cleanup()
})

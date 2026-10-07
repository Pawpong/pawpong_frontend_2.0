const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const code = ts.transpileModule(fs.readFileSync('src/shared/lib/nativeBridge.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
function setup(capabilities) {
  const window = new EventTarget()
  const document = new EventTarget()
  const messages = []
  const timers = new Set()
  window.ReactNativeWebView = { postMessage: (value) => messages.push(JSON.parse(value)) }
  window.__PAWPONG_APP__ = { bridgeVersion: 1, capabilities }
  const output = {}
  new Function('exports', 'window', 'document', 'setTimeout', 'clearTimeout', code)(
    output,
    window,
    document,
    (callback) => {
      timers.add(callback)
      return callback
    },
    (id) => timers.delete(id),
  )
  const respond = (data, target = window) =>
    target.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(data) }))
  return { ...output, messages, timers, respond, document }
}

test('old app with only bridgeVersion never receives a new unsupported request', async () => {
  const app = setup(undefined)
  assert.equal(app.hasNativeCapability('nativeShare'), false)
  await assert.rejects(app.shareNatively({ url: 'https://pawpong.kr/', title: 'Pawpong' }))
  assert.equal(app.messages.length, 0)
})

test('native sharing correlates the request and handles dismissal without an error', async () => {
  const app = setup({ nativeShare: true })
  let settled = false
  const pending = app
    .shareNatively({ url: 'https://pawpong.kr/', title: 'Pawpong' })
    .then((value) => {
      settled = true
      return value
    })
  const request = app.messages[0]
  app.respond({ type: 'SHARE_RESULT', requestId: 'unrelated', status: 'shared' })
  await Promise.resolve()
  assert.equal(settled, false)
  app.respond({ type: 'SHARE_RESULT', requestId: request.requestId, status: 'dismissed' })
  assert.equal(await pending, 'dismissed')
  assert.equal(app.timers.size, 0)
})

test('Android document messages report camera denial and timeout frees pending listeners', async () => {
  const app = setup({ cameraPermission: true })
  const denied = app.requestCameraPermission()
  app.respond(
    { type: 'CAMERA_PERMISSION_RESULT', requestId: app.messages[0].requestId, granted: false },
    app.document,
  )
  assert.equal(await denied, false)
  const unresponsive = app.requestCameraPermission()
  for (const timeout of app.timers) timeout()
  await assert.rejects(unresponsive)
  assert.equal(app.timers.size, 0)
})

test('old apps never receive notification permission or settings requests', async () => {
  const app = setup({ pushTokenSession: true })
  await assert.rejects(app.getNativeNotificationPermission())
  await assert.rejects(app.openNativeNotificationSettings())
  assert.equal(app.messages.length, 0)
})

test('notification permission correlates IDs and keeps OS query failures distinct from denial', async () => {
  const app = setup({ notificationPermission: true })
  const denied = app.getNativeNotificationPermission()
  app.respond({
    type: 'NOTIFICATION_PERMISSION_RESULT',
    requestId: app.messages[0].requestId,
    granted: false,
  })
  assert.equal(await denied, false)
  const unknown = app.getNativeNotificationPermission()
  app.respond({
    type: 'NOTIFICATION_PERMISSION_RESULT',
    requestId: app.messages[1].requestId,
    granted: null,
  })
  await assert.rejects(unknown)
  assert.equal(app.timers.size, 0)
})

test('notification settings report errors and release listeners after successful opens', async () => {
  const app = setup({ notificationSettings: true })
  const opened = app.openNativeNotificationSettings()
  app.respond(
    {
      type: 'OPEN_NOTIFICATION_SETTINGS_RESULT',
      requestId: app.messages[0].requestId,
      status: 'opened',
    },
    app.document,
  )
  await opened
  const failed = app.openNativeNotificationSettings()
  app.respond({
    type: 'OPEN_NOTIFICATION_SETTINGS_RESULT',
    requestId: app.messages[1].requestId,
    status: 'error',
  })
  await assert.rejects(failed)
  assert.equal(app.timers.size, 0)
})

test('aborted payment requests release listeners and cannot accept late receipts', async () => {
  const app = setup({ inAppPurchase: true })
  const controller = new AbortController()
  const pending = app.requestNative(
    'inAppPurchase',
    'IAP_PURCHASE',
    'IAP_PURCHASE_RESULT',
    {},
    1000,
    controller.signal,
  )
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(app.timers.size, 0)
  await assert.rejects(
    app.requestNative(
      'inAppPurchase',
      'IAP_PURCHASE',
      'IAP_PURCHASE_RESULT',
      {},
      1000,
      controller.signal,
    ),
    { name: 'AbortError' },
  )
  assert.equal(app.messages.length, 1)
})

test('app badge goes only to apps that advertise it and its reply frees the listener', async () => {
  const old = setup({ nativeShare: true })
  old.setNativeAppBadge(3)
  assert.equal(old.messages.length, 0)
  const app = setup({ appBadge: true })
  app.setNativeAppBadge(3)
  assert.deepEqual(
    { ...app.messages[0], requestId: undefined },
    { type: 'SET_APP_BADGE', count: 3, requestId: undefined },
  )
  app.respond({ type: 'APP_BADGE_RESULT', requestId: app.messages[0].requestId, status: 'set' })
  assert.equal(app.timers.size, 0)
})

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

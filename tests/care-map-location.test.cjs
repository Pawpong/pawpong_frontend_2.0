const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(
  fs.readFileSync('src/features/care-map/lib/care-location.ts', 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  },
).outputText
function setup(state = 'granted', query) {
  const timers = new Map(),
    events = [],
    requests = []
  const permission = new EventTarget()
  permission.state = state
  const browser = {
    permissions: { query: query || (async () => permission) },
    geolocation: {
      getCurrentPosition: (success, failure, options) =>
        requests.push({ success, failure, options }),
    },
  }
  const output = {}
  new Function('exports', 'setTimeout', 'clearTimeout', source)(
    output,
    (fn, ms) => {
      timers.set(fn, ms)
      return fn
    },
    (fn) => timers.delete(fn),
  )
  const callbacks = {
    onChecking: () => events.push('checking'),
    onLocated: (value) => events.push(value),
    onFailure: (reason) => events.push(reason),
  }
  return { ...output, browser, permission, timers, events, requests, callbacks }
}
const flush = () => new Promise((resolve) => setImmediate(resolve))
const validPosition = { coords: { latitude: 37.5665, longitude: 126.978 } }
test('already granted starts once and delivers nearby coordinates without requesting permission', async () => {
  const app = setup()
  app.startCareLocation(app.browser, 'granted-only', app.callbacks)
  await flush()
  assert.equal(app.requests.length, 1)
  assert.deepEqual(app.events, ['checking'])
  app.requests[0].success(validPosition)
  app.requests[0].success(validPosition)
  assert.deepEqual(app.events, ['checking', validPosition.coords])
  assert.equal(app.timers.size, 0)
})
for (const state of ['prompt', 'denied'])
  test(`${state} never calls geolocation automatically`, async () => {
    const app = setup(state)
    app.startCareLocation(app.browser, 'granted-only', app.callbacks)
    await flush()
    assert.equal(app.requests.length, 0)
    assert.deepEqual(app.events, [])
    assert.equal(app.timers.size, 0)
  })
test('missing, rejected and synchronously unsupported permission queries retain nationwide', async () => {
  for (const query of [
    undefined,
    () => Promise.reject(new Error('unsupported')),
    () => {
      throw new Error('unsupported')
    },
  ]) {
    const app = setup('granted', query)
    if (!query) app.browser.permissions = undefined
    app.startCareLocation(app.browser, 'granted-only', app.callbacks)
    await flush()
    assert.equal(app.requests.length, 0)
    assert.deepEqual(app.events, [])
  }
})
test('permission query deadline prevents a late grant from obtaining location', async () => {
  let resolve
  const app = setup(
    'granted',
    () =>
      new Promise((done) => {
        resolve = done
      }),
  )
  app.startCareLocation(app.browser, 'granted-only', app.callbacks)
  await flush()
  app.timers.keys().next().value()
  resolve(app.permission)
  await flush()
  assert.equal(app.requests.length, 0)
})
test('typing, selecting a region, panning or unmounting can cancel pending permission and position callbacks', async () => {
  for (const phase of ['permission', 'position']) {
    const app = setup()
    const cancel = app.startCareLocation(app.browser, 'granted-only', app.callbacks)
    if (phase === 'position') await flush()
    cancel()
    await flush()
    const before = [...app.events]
    app.requests[0]?.success(validPosition)
    app.requests[0]?.failure({ code: 1 })
    assert.deepEqual(app.events, before)
    assert.equal(app.timers.size, 0)
  }
})
test('position denial, timeout, invalid coordinates and permission revocation release locating state', async () => {
  for (const failure of ['denied', 'timeout', 'invalid', 'revoked']) {
    const app = setup()
    app.startCareLocation(app.browser, 'granted-only', app.callbacks)
    await flush()
    if (failure === 'denied') app.requests[0].failure({ code: 1 })
    if (failure === 'timeout') app.timers.keys().next().value()
    if (failure === 'invalid')
      app.requests[0].success({ coords: { latitude: NaN, longitude: 126 } })
    if (failure === 'revoked') {
      app.permission.state = 'denied'
      app.permission.dispatchEvent(new Event('change'))
    }
    const expected =
      failure === 'invalid' ? 'outside-korea' : failure === 'timeout' ? 'unavailable' : 'denied'
    assert.deepEqual(app.events, ['checking', expected])
    app.requests[0].success(validPosition)
    assert.equal(app.events.length, 2)
    assert.equal(app.timers.size, 0)
  }
})
test('manual nearby remains available when permissions query is unavailable', () => {
  const app = setup()
  app.browser.permissions = undefined
  app.startCareLocation(app.browser, 'manual', app.callbacks)
  assert.equal(app.requests.length, 1)
  app.requests[0].success(validPosition)
  assert.deepEqual(app.events, ['checking', validPosition.coords])
})

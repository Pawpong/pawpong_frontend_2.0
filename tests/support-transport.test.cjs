const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const result = {}
  new Function('exports', 'require', ...Object.keys(globals), code)(
    result,
    (name) => dependencies[name] ?? require(name),
    ...Object.values(globals),
  )
  return result
}
const contract = load('src/features/inquiry/model/supportConversation.ts')
const data = {
  conversationId: '11111111-1111-4111-8111-111111111111',
  category: 'usage',
  userType: 'adopter',
  revision: 0,
  messages: [],
  draft: null,
  submission: null,
  expiresAt: '2026-10-10',
}
function transport(fetch) {
  const timers = []
  const cleared = []
  const { supportChatApi } = load(
    'src/features/inquiry/api/supportConversation.api.ts',
    {
      '../model/supportConversation': contract,
    },
    {
      fetch,
      AbortSignal: {}, // iOS 15: no static timeout helper.
      AbortController,
      setTimeout: (callback, delay) => {
        timers.push({ callback, delay })
        return timers.length
      },
      clearTimeout: (timer) => cleared.push(timer),
    },
  )
  return { api: supportChatApi, timers, cleared }
}

test('legacy AbortSignal without timeout reaches fetch and keeps cancellation until JSON completes', async () => {
  let resolveJson
  let options
  const { api, timers, cleared } = transport(async (_, init) => {
    options = init
    return {
      ok: true,
      status: 200,
      json: () =>
        new Promise((resolve) => {
          resolveJson = resolve
        }),
    }
  })
  const request = api.create('usage', 'adopter')
  await Promise.resolve()
  assert.equal(options.method, 'POST')
  assert.equal(options.signal.aborted, false)
  assert.equal(timers[0].delay, 65_000)
  assert.deepEqual(cleared, [])
  resolveJson({ success: true, data })
  assert.equal((await request).conversationId, data.conversationId)
  assert.deepEqual(cleared, [1])
})

test('timeout aborts the real request signal and returns a retryable transport failure', async () => {
  let signal
  const { api, timers, cleared } = transport(
    (_, init) =>
      new Promise((_, reject) => {
        signal = init.signal
        signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')))
      }),
  )
  const request = api.get(data.conversationId)
  timers[0].callback()
  await assert.rejects(
    request,
    (error) => error instanceof contract.SupportChatError && error.status === 0,
  )
  assert.equal(signal.aborted, true)
  assert.deepEqual(cleared, [1])
})

test('network failure cleans up the timer without hiding a recoverable error', async () => {
  const { api, cleared } = transport(async () => {
    throw new TypeError('offline')
  })
  await assert.rejects(api.get(data.conversationId), (error) => error.status === 0)
  assert.deepEqual(cleared, [1])
})

test('server conflict codes survive transport handling and always clean up cancellation', async () => {
  const { api, cleared } = transport(async () => ({
    ok: false,
    status: 409,
    json: async () => ({ success: false, errorCode: 'REVISION_CONFLICT' }),
  }))
  await assert.rejects(
    api.submit(data.conversationId, 0),
    (error) =>
      error instanceof contract.SupportChatError &&
      error.status === 409 &&
      error.code === 'REVISION_CONFLICT',
  )
  assert.deepEqual(cleared, [1])
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { NextRequest } = require('next/server')
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
const schema = load('src/features/inquiry/model/supportConversation.ts')
const id = '11111111-1111-4111-8111-111111111111'
const secret = 'test-capability-not-a-real-token'
const envelope = {
  success: true,
  data: {
    conversationId: id,
    category: 'usage',
    userType: 'adopter',
    revision: 0,
    messages: [],
    draft: null,
    sources: [],
    needsHumanSupport: false,
    submission: null,
    expiresAt: '2026-10-10',
    accessToken: secret,
  },
}
function setup(upstream = async () => Response.json(envelope)) {
  const calls = []
  const routes = load(
    'src/app/api/support/conversations/[[...segments]]/route.ts',
    {
      '@/shared/lib/server/sameOrigin': load('src/shared/lib/server/sameOrigin.ts'),
      '@/features/inquiry/server': load('src/features/inquiry/server.ts', {
        './model/supportConversation': schema,
        './api/supportCreationLimit.server': load(
          'src/features/inquiry/api/supportCreationLimit.server.ts',
        ),
      }),
    },
    {
      process: {
        env: { NODE_ENV: 'production', NEXT_PUBLIC_API_BASE_URL: 'https://api.pawpong.kr/' },
      },
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  const request = (
    method = 'POST',
    path = '',
    body = { category: 'usage', userType: 'adopter', consent: true },
    headers = {},
  ) =>
    new NextRequest(`https://pawpong.kr/api/support/conversations${path}`, {
      method,
      headers: { origin: 'https://pawpong.kr', 'content-type': 'application/json', ...headers },
      ...(['GET', 'DELETE'].includes(method)
        ? {}
        : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    })
  const context = (segments) => ({ params: Promise.resolve({ segments }) })
  return { ...routes, calls, request, context }
}

test('create stores capability only in a path-scoped HttpOnly cookie and strips extra fields', async () => {
  const app = setup(async () =>
    Response.json({
      ...envelope,
      internal: secret,
      data: { ...envelope.data, internalToken: secret },
    }),
  )
  const response = await app.POST(app.request(), app.context([]))
  const body = await response.text()
  assert.equal(response.status, 200)
  assert.equal(body.includes(secret), false)
  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /SameSite=strict/)
  assert.ok(cookie.includes(`/api/support/conversations/${id}`))
  assert.match(response.headers.get('cache-control'), /no-store/)
  assert.equal(app.calls[0][1].credentials, 'omit')
  assert.equal(app.calls[0][1].redirect, 'error')
})

test('GET forwards only support capability and does not leak auth/cookies/forwarded IP', async () => {
  const app = setup()
  const response = await app.GET(
    app.request('GET', `/${id}`, null, {
      cookie: `pawpongSupportConversation=${secret}; refreshToken=private`,
      authorization: 'Bearer private',
      'x-forwarded-for': 'attacker',
    }),
    app.context([id]),
  )
  assert.equal(response.status, 200)
  assert.deepEqual(app.calls[0][1].headers, {
    'Content-Type': 'application/json',
    'X-Support-Token': secret,
  })
  assert.equal(app.calls[0][1].cache, 'no-store')
  assert.match(response.headers.get('cache-control'), /no-store/)
  assert.equal((await response.text()).includes(secret), false)
})

test('missing capability and invalid paths fail before backend access', async () => {
  for (const path of [[id], ['../auth'], [id, 'unrelated'], [id, 'turns', 'extra']]) {
    const app = setup()
    const response = await app.POST(app.request('POST', '/test'), app.context(path))
    assert.ok([401, 404].includes(response.status))
    assert.equal(app.calls.length, 0)
  }
})

test('cross-origin and cross-site mutations are rejected', async () => {
  for (const headers of [{ origin: 'https://other.example' }, { 'sec-fetch-site': 'cross-site' }]) {
    const app = setup()
    assert.equal(
      (await app.POST(app.request('POST', '', {}, headers), app.context([]))).status,
      403,
    )
    assert.equal(app.calls.length, 0)
  }
})

test('BFF rejects non-JSON, malformed and oversized bodies', async () => {
  for (const [body, headers, status] of [
    ['{}', { 'content-type': 'text/plain' }, 415],
    ['{', {}, 400],
    ['x'.repeat(17000), {}, 413],
  ]) {
    const app = setup()
    assert.equal(
      (await app.POST(app.request('POST', '', body, headers), app.context([]))).status,
      status,
    )
    assert.equal(app.calls.length, 0)
  }
})

test('known conflict prefix survives as code while raw backend errors are removed', async () => {
  const app = setup(async () =>
    Response.json(
      { success: false, error: `REVISION_CONFLICT: ${secret}`, accessToken: secret },
      { status: 409 },
    ),
  )
  const response = await app.POST(app.request(), app.context([]))
  assert.equal(response.status, 409)
  const body = await response.json()
  assert.equal(body.errorCode, 'REVISION_CONFLICT')
  assert.equal(JSON.stringify(body).includes(secret), false)
})

test('unrecognized errors, malformed success and transport failures never expose internals', async () => {
  for (const upstream of [
    async () => Response.json({ success: false, error: secret }, { status: 500 }),
    async () => Response.json({ success: true, data: { accessToken: secret } }),
    async () => {
      throw new Error(secret)
    },
  ]) {
    const app = setup(upstream)
    const response = await app.POST(app.request(), app.context([]))
    assert.equal(response.status, 502)
    assert.equal((await response.text()).includes(secret), false)
  }
})

test('forget removes only one conversation cookie and never deletes backend data', async () => {
  const app = setup()
  const response = await app.DELETE(app.request('DELETE', `/${id}`), app.context([id]))
  assert.equal(response.status, 200)
  assert.equal(app.calls.length, 0)
  assert.ok(response.headers.get('set-cookie').includes(`/api/support/conversations/${id}`))
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/)
})

test('instance-local create limiter allows five per session and resets after one minute', () => {
  const { takeSupportCreationSlot } = load(
    'src/features/inquiry/api/supportCreationLimit.server.ts',
  )
  let { sessionId } = takeSupportCreationSlot(undefined, 0)
  for (let count = 0; count < 4; count++)
    assert.equal(takeSupportCreationSlot(sessionId, 0).allowed, true)
  assert.equal(takeSupportCreationSlot(sessionId, 0).allowed, false)
  assert.equal(takeSupportCreationSlot(sessionId, 60001).allowed, true)
})

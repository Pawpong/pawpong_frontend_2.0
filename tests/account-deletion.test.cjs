const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { NextRequest } = require('next/server')

function load(file, overrides = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', ...Object.keys(globals), source)(
    output,
    (name) => overrides[name] ?? require(name),
    ...Object.values(globals),
  )
  return output
}
const policy = load('src/shared/lib/accountDeletion.ts')
const cookiePolicy = load('src/shared/lib/server/authCookies.ts')
const status = {
  requestId: '8489a5c2-1e57-420e-bb76-2ec48b2c5769',
  status: 'pending',
  requestedAt: '2026-09-24T00:00:00.000Z',
  appleConnectionRemovalRequired: true,
}
const receiptToken = 's'.repeat(43)
const accepted = { success: true, data: { ...status, receiptToken } }
const body = { confirmation: 'DELETE_PERMANENTLY' }
const authCookie = 'accessToken=current-user-token; refreshToken=never-forward-me'
const receiptCookie = `pawpongDeletionReceipt=${encodeURIComponent(JSON.stringify({ requestId: status.requestId, receiptToken }))}`

function setup(upstream = async () => Response.json(accepted)) {
  const calls = []
  const globals = {
    process: {
      env: { NODE_ENV: 'production', NEXT_PUBLIC_API_BASE_URL: 'https://api.pawpong.kr/' },
    },
    fetch: async (...args) => {
      calls.push(args)
      return upstream(...args)
    },
  }
  const server = load(
    'src/app/api/account-deletion/_lib/server.ts',
    {
      '@/shared/lib/accountDeletion': policy,
      '@/shared/lib/server/sameOrigin': load('src/shared/lib/server/sameOrigin.ts'),
    },
    globals,
  )
  const dependencies = {
    '@/shared/lib/accountDeletion': policy,
    '@/shared/lib/server/authCookies': cookiePolicy,
    './_lib/server': server,
    '../_lib/server': server,
  }
  const requestRoute = load('src/app/api/account-deletion/route.ts', dependencies)
  const statusRoute = load('src/app/api/account-deletion/status/route.ts', dependencies)
  const prepareRoute = load('src/app/api/account-deletion/prepare/route.ts', dependencies)
  function request(value = body, headers = {}, path = '', method = 'POST') {
    return new NextRequest(`https://pawpong.kr/api/account-deletion${path}`, {
      method,
      headers: {
        origin: 'https://pawpong.kr',
        host: 'pawpong.kr',
        'content-type': 'application/json',
        cookie: `${authCookie}; ${receiptCookie}`,
        ...headers,
      },
      body: method === 'POST' ? JSON.stringify(value) : undefined,
    })
  }
  return {
    calls,
    request,
    POST: requestRoute.POST,
    status: statusRoute.POST,
    close: statusRoute.DELETE,
    prepare: prepareRoute.POST,
  }
}

test('deletion BFF requires explicit confirmation/current cookie, never caller-supplied user or token', async () => {
  const app = setup()
  for (const value of [{}, { confirmation: 'DELETE' }, null])
    assert.equal((await app.POST(app.request(value))).status, 400)
  assert.equal(
    (await app.POST(app.request(body, { cookie: '', Authorization: 'Bearer supplied-token' })))
      .status,
    401,
  )
  assert.equal(app.calls.length, 0)
  const response = await app.POST(
    app.request({ ...body, userId: 'other-user', accessToken: 'supplied-token' }),
  )
  assert.equal(response.status, 200)
  const [url, options] = app.calls[0]
  assert.equal(url, 'https://api.pawpong.kr/api/v2/account-deletion')
  assert.deepEqual(JSON.parse(options.body), { ...body, requestId: status.requestId, receiptToken })
  assert.equal(options.headers.Authorization, 'Bearer current-user-token')
  assert.equal(options.headers.Cookie, undefined)
  assert.equal(options.credentials, 'omit')
  assert.equal(options.redirect, 'error')
  assert.equal(options.cache, 'no-store')
})

test('receipt secret remains HttpOnly/secure/path-scoped, while response expires all auth cookie variants', async () => {
  const app = setup()
  const prepared = await app.prepare(app.request({}, { cookie: authCookie }, '/prepare'))
  const receipt = prepared.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith('pawpongDeletionReceipt='))
  assert.match(receipt, /HttpOnly/i)
  assert.match(receipt, /Secure/)
  assert.match(receipt, /SameSite=strict/i)
  assert.match(receipt, /Path=\/api\/account-deletion/)
  assert.deepEqual(await prepared.json(), { success: true, prepared: true })
  const response = await app.POST(app.request())
  const data = await response.json()
  assert.deepEqual(data, { success: true, data: status })
  assert.equal(JSON.stringify(data).includes(receiptToken), false)
  assert.match(response.headers.get('cache-control'), /no-store/)
  const cookies = response.headers.getSetCookie()
  assert.equal(
    cookies.some((cookie) => cookie.startsWith('pawpongDeletionReceipt=')),
    false,
  )
  for (const name of ['accessToken', 'refreshToken', 'userRole']) {
    const matching = cookies.filter((cookie) => cookie.startsWith(`${name}=`))
    assert.equal(matching.length, 2)
    assert.ok(matching.every((cookie) => cookie.includes('Max-Age=0')))
    assert.ok(matching.some((cookie) => cookie.includes('Domain=.pawpong.kr')))
  }
})

test('request/status/receipt cleanup all reject CSRF before backend or cookie mutation', async () => {
  for (const headers of [
    { origin: 'https://evil.example' },
    { origin: 'null' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    const app = setup()
    for (const method of [app.POST, app.status, app.close, app.prepare]) {
      const response = await method(app.request(body, { cookie: receiptCookie, ...headers }))
      assert.equal(response.status, 403)
      assert.equal(response.headers.get('set-cookie'), null)
    }
    assert.equal(app.calls.length, 0)
  }
})

test('fresh browser status requires receipt; credentials in body or URL do not grant access', async () => {
  const app = setup()
  assert.equal(
    (
      await app.status(
        app.request(
          { requestId: status.requestId, receiptToken },
          { cookie: '' },
          `/status?receiptToken=${receiptToken}`,
        ),
      )
    ).status,
    404,
  )
  assert.equal(
    (await app.status(app.request({}, { cookie: 'pawpongDeletionReceipt=broken' }, '/status')))
      .status,
    404,
  )
  assert.equal(app.calls.length, 0)
})

for (const state of ['pending', 'processing', 'retryable', 'review_required', 'completed']) {
  test(`status ${state} works without login after refresh and never exposes receipt/user fields`, async () => {
    const app = setup(async () =>
      Response.json({
        success: true,
        data: {
          ...status,
          status: state,
          receiptToken,
          email: 'private@example.com',
          userId: 'private-user',
        },
      }),
    )
    const response = await app.status(
      app.request({ receiptToken: 'forged' }, { cookie: receiptCookie }, '/status'),
    )
    const data = await response.json()
    assert.equal(response.status, 200)
    assert.equal(data.data.status, state)
    assert.equal(data.data.receiptToken, undefined)
    assert.equal(data.data.email, undefined)
    assert.equal(data.data.userId, undefined)
    const [url, options] = app.calls[0]
    assert.equal(url, 'https://api.pawpong.kr/api/v2/account-deletion/status')
    assert.equal(options.headers.Authorization, undefined)
    assert.deepEqual(JSON.parse(options.body), { requestId: status.requestId, receiptToken })
  })
}

test('status mismatch/malformed upstream is rejected; failed deletion never clears session or replaces receipt', async () => {
  for (const data of [{}, { ...status, requestId: '7250e6f9-5b8c-4bdf-ac0c-66d9d11b006b' }]) {
    const app = setup(async () => Response.json({ success: true, data }))
    const response = await app.status(app.request({}, { cookie: receiptCookie }, '/status'))
    assert.equal(response.status, 502)
  }
  for (const code of [401, 409, 429, 500, 503]) {
    const app = setup(async () => Response.json({ message: receiptToken }, { status: code }))
    const response = await app.POST(app.request())
    assert.equal(response.status, code === 500 ? 502 : code)
    if (code === 401)
      assert.match(response.headers.get('set-cookie'), /accessToken=; Path=\/; Max-Age=0/)
    else assert.equal(response.headers.get('set-cookie'), null)
    assert.equal((await response.text()).includes(receiptToken), false)
  }
})

test('network failure is generic; closing browser receipt never cancels backend deletion', async () => {
  const app = setup(async () => {
    throw new Error(receiptToken)
  })
  const response = await app.POST(app.request())
  assert.equal(response.status, 503)
  assert.equal((await response.text()).includes(receiptToken), false)
  const before = app.calls.length
  const closed = await app.close(app.request({}, { cookie: receiptCookie }, '/status', 'DELETE'))
  assert.equal(closed.status, 200)
  assert.match(closed.headers.get('set-cookie'), /Max-Age=0/)
  assert.equal(app.calls.length, before)
})

test('ordinary logout uses the same cookie expiration policy for local and forwarded production hosts', async () => {
  const route = load('src/app/api/auth/clear-cookie/route.ts', {
    '@/shared/lib/server/authCookies': cookiePolicy,
  })
  for (const [host, forwarded, count] of [
    ['localhost:3000', '', 3],
    ['internal.vercel.app', 'pawpong.kr', 6],
  ]) {
    const request = new NextRequest(`https://${host}/api/auth/clear-cookie`, {
      method: 'POST',
      headers: { host, ...(forwarded ? { 'x-forwarded-host': forwarded } : {}) },
    })
    const response = await route.POST(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.getSetCookie().length, count)
  }
})

function setupClient(
  upstream = async () => Response.json({ success: true, data: status }),
  prepare = async () => Response.json({ success: true, prepared: true }),
) {
  const events = []
  const client = load(
    'src/features/account-deletion/api/accountDeletion.ts',
    {
      '@/shared/lib/accountDeletion': policy,
      '@/shared/lib/authSessionLifecycle': {
        beginLogout: () => events.push('logout-intent'),
        beginLogin: () => events.push('restore-session'),
        waitForAuthCookieWrites: async () => events.push('wait-cookie-writes'),
      },
      '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => events.push('notify-auth') },
      '@/shared/lib/authSessionRecovery': {
        clearAuthCookies: async () => {
          events.push('/api/auth/clear-cookie')
          await upstream('/api/auth/clear-cookie').catch(() => {})
        },
      },
      '@/shared/lib/nativePushSession': {
        unregisterNativePushSession: async () => events.push('native-unregister'),
      },
    },
    {
      fetch: async (url, options) => {
        events.push(url)
        if (url.endsWith('/prepare')) return prepare()
        return upstream(url, options)
      },
    },
  )
  return { ...client, events }
}

test('client unbinds native before authenticated deletion, then clears local session/cache without protected logout API', async () => {
  const app = setupClient()
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.deepEqual(app.events, [
    '/api/account-deletion/prepare',
    'logout-intent',
    'notify-auth',
    'native-unregister',
    'wait-cookie-writes',
    '/api/account-deletion',
    'wait-cookie-writes',
    '/api/auth/clear-cookie',
    'clear-query-cache',
    'notify-auth',
  ])
})

test('BFF already clears cookies, so local clear-cookie outage cannot erase accepted receipt or skip cache cleanup', async () => {
  const app = setupClient(async (url) => {
    if (url.includes('clear-cookie')) throw new Error('offline')
    return Response.json({ success: true, data: status })
  })
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.ok(app.events.includes('clear-query-cache'))
  assert.equal(app.events.includes('restore-session'), false)
})

test('failed deletion never claims acceptance, and releases local logout guard for retry', async () => {
  for (const upstream of [
    async () => Response.json({ message: receiptToken }, { status: 409 }),
    async () => {
      throw new Error(receiptToken)
    },
  ]) {
    const app = setupClient(upstream)
    await assert.rejects(
      app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
      (error) => !error.message.includes(receiptToken),
    )
    assert.ok(app.events.includes('restore-session'))
    assert.equal(app.events.includes('clear-query-cache'), false)
    assert.equal(app.events.includes('/api/auth/clear-cookie'), false)
  }
})

test('prepare keeps existing receipt across retries and does not mutate account or contact backend', async () => {
  const app = setup()
  const response = await app.prepare(app.request({}, {}, '/prepare'))
  const cookie = response.headers.getSetCookie()[0]
  assert.ok(decodeURIComponent(cookie).includes(receiptToken))
  assert.equal(app.calls.length, 0)
  assert.equal((await app.prepare(app.request({}, { cookie: '' }, '/prepare'))).status, 401)
  assert.equal((await app.POST(app.request(body, { cookie: authCookie }))).status, 400)
  assert.equal(app.calls.length, 0)
})

test('prepare failure leaves authentication and push untouched', async () => {
  const app = setupClient(undefined, async () => Response.json({ success: false }, { status: 401 }))
  await assert.rejects(app.requestAccountDeletion(() => app.events.push('clear-query-cache')))
  assert.deepEqual(app.events, ['/api/account-deletion/prepare'])
})

test('lost deletion response recovers accepted receipt before cleaning session, without a second deletion request', async () => {
  const app = setupClient(async (url) => {
    if (url === '/api/account-deletion') throw new Error('connection reset after server accepted')
    return Response.json({ success: true, data: status })
  })
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.equal(app.events.filter((event) => event === '/api/account-deletion').length, 1)
  assert.ok(app.events.includes('/api/account-deletion/status'))
  assert.ok(app.events.includes('clear-query-cache'))
  assert.equal(app.events.includes('restore-session'), false)
})

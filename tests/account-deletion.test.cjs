const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { NextRequest } = require('next/server')
const { authCookieFixture } = require('./fixtures/auth-cookie.fixture.cjs')

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

test('탈퇴 BFF가 명시적 확인과 현재 쿠키를 요구하고 전달받은 사용자나 토큰을 신뢰하지 않음', async () => {
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

test('조회 비밀값의 쿠키 범위를 보호하고 응답에서 모든 인증 쿠키 변형을 만료함', async () => {
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

test('탈퇴 요청과 상태 조회 및 영수증 정리가 백엔드 호출과 쿠키 변경 전에 위조 요청을 거부함', async () => {
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

test('새 브라우저의 상태 조회는 영수증을 요구하고 본문이나 주소의 인증값을 허용하지 않음', async () => {
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
  test(`${state} 상태를 로그인 없이 다시 조회할 수 있으며 비밀값과 사용자 필드를 노출하지 않음`, async () => {
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

test('맞지 않거나 잘못된 상태 응답을 거부하고 탈퇴 실패 시 세션과 영수증을 유지함', async () => {
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

test('통신 오류를 일반화하고 브라우저 조회 기록을 닫아도 서버 탈퇴를 취소하지 않음', async () => {
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

test('일반 로그아웃이 로컬과 전달된 운영 호스트에서 같은 쿠키 만료 정책을 사용함', async () => {
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
  const lifecycle = {
    beginLogout: () => events.push('logout-intent'),
    beginLogin: () => events.push('restore-session'),
    waitForAuthCookieWrites: async () => events.push('wait-cookie-writes'),
    getAuthSessionGeneration: () => 0,
  }
  const boundary = authCookieFixture({ getAccessToken: () => 'synthetic-session' }, lifecycle)
  const client = load(
    'src/features/account-deletion/api/accountDeletion.ts',
    {
      '@/shared/lib/accountDeletion': policy,
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/authCookieLock': boundary.lock,
      '@/shared/lib/authCookieScope': boundary.scope,
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

test('클라이언트가 인증된 탈퇴 전에 네이티브 연결을 해제하고 추가 로그아웃 없이 세션과 캐시를 정리함', async () => {
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

test('쿠키 정리 장애에도 이미 접수된 영수증을 유지하고 캐시 정리를 수행함', async () => {
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

test('탈퇴 실패를 접수 성공으로 처리하지 않고 로그아웃 가드를 해제해 재시도를 허용함', async () => {
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

test('사전 확인 재시도는 기존 영수증을 유지하고 계정 변경이나 백엔드 호출을 수행하지 않음', async () => {
  const app = setup()
  const response = await app.prepare(app.request({}, {}, '/prepare'))
  const cookie = response.headers.getSetCookie()[0]
  assert.ok(decodeURIComponent(cookie).includes(receiptToken))
  assert.equal(app.calls.length, 0)
  assert.equal((await app.prepare(app.request({}, { cookie: '' }, '/prepare'))).status, 401)
  assert.equal((await app.POST(app.request(body, { cookie: authCookie }))).status, 400)
  assert.equal(app.calls.length, 0)
})

test('사전 확인 실패는 인증과 푸시 연결을 변경하지 않음', async () => {
  const app = setupClient(undefined, async () => Response.json({ success: false }, { status: 401 }))
  await assert.rejects(app.requestAccountDeletion(() => app.events.push('clear-query-cache')))
  assert.deepEqual(app.events, ['/api/account-deletion/prepare'])
})

test('탈퇴 응답이 유실되면 재요청 없이 영수증을 복구한 뒤 세션을 정리함', async () => {
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

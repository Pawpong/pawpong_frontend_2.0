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
const policy = load('src/shared/lib/reviewLogin.ts')
const credentials = { emailAddress: 'review@example.com', password: 'test password' }
const session = {
  success: true,
  data: {
    accessToken: 'access-from-backend',
    refreshToken: 'refresh-from-backend',
    expiresIn: 3600,
    user: {
      userId: 'review-user',
      email: credentials.emailAddress,
      role: 'adopter',
      nickname: '심사',
    },
  },
}
function setupRoute(upstream = async () => Response.json(session)) {
  const calls = []
  const route = load(
    'src/app/api/auth/review-login/route.ts',
    {
      '@/shared/lib/reviewLogin': policy,
      '@/shared/lib/server/sameOrigin': load('src/shared/lib/server/sameOrigin.ts'),
    },
    {
      process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.pawpong.kr/' } },
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  const request = (body = credentials, headers = {}) =>
    new NextRequest('https://pawpong.kr/api/auth/review-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://pawpong.kr', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  return { ...route, calls, request }
}
function setupClient(upstream) {
  const storage = new Map()
  const lifecycle = load(
    'src/shared/lib/authSessionLifecycle.ts',
    {},
    {
      localStorage: {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    },
  )
  const saved = []
  const calls = []
  const client = load(
    'src/features/auth/api/review-login.ts',
    {
      '@/shared/lib/reviewLogin': policy,
      '@/shared/lib/authSessionLifecycle': lifecycle,
      '@/shared/lib/saveAuthTokens': {
        saveAuthTokens: async (tokens) => {
          saved.push(tokens)
          return true
        },
      },
    },
    {
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  return { ...client, ...lifecycle, saved, calls }
}

for (const role of ['adopter', 'breeder']) {
  test(`BFF가 백엔드의 ${role} 인증을 유지하고 예상하지 않은 필드를 제거함`, async () => {
    const result = structuredClone(session)
    result.data.user.role = role
    result.data.password = 'never forward'
    result.internal = 'private details'
    const app = setupRoute(async () => Response.json(result))
    const response = await app.POST(
      app.request({ ...credentials, emailAddress: '  REVIEW@EXAMPLE.COM ', role: 'admin' }),
    )
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0')
    assert.equal(response.headers.get('pragma'), 'no-cache')
    assert.equal(response.headers.get('set-cookie'), null)
    const data = await response.json()
    assert.equal(data.data.user.role, role)
    assert.equal(data.data.password, undefined)
    assert.equal(data.internal, undefined)
    const [url, options] = app.calls[0]
    assert.equal(url, 'https://api.pawpong.kr/api/auth/review-login')
    assert.deepEqual(JSON.parse(options.body), credentials)
    assert.equal(options.credentials, 'omit')
    assert.equal(options.redirect, 'error')
    assert.equal(options.cache, 'no-store')
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.headers.Cookie, undefined)
    assert.equal(options.headers['X-Forwarded-For'], undefined)
    assert.ok(options.signal instanceof AbortSignal)
  })
}

test('BFF가 백엔드 호출 전에 다른 출처와 사이트의 요청을 거부함', async () => {
  for (const headers of [
    { origin: 'https://attacker.example' },
    { origin: 'null' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    const app = setupRoute()
    const response = await app.POST(app.request(credentials, headers))
    assert.equal(response.status, 403)
    assert.equal(app.calls.length, 0)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
})

test('BFF가 선택적인 Origin 헤더가 없어도 동일 출처 JSON 요청을 허용함', async () => {
  const app = setupRoute()
  const request = app.request()
  request.headers.delete('origin')
  assert.equal((await app.POST(request)).status, 200)
})

test('BFF가 호출 전에 잘못되거나 과도한 입력과 bcrypt 바이트 초과를 거부함', async () => {
  const bodies = [
    '{',
    null,
    {},
    { ...credentials, emailAddress: 'bad' },
    { ...credentials, password: '' },
    { ...credentials, password: '가'.repeat(25) },
    { ...credentials, padding: 'x'.repeat(5000) },
  ]
  for (const body of bodies) {
    const app = setupRoute()
    assert.equal((await app.POST(app.request(body))).status, 400)
    assert.equal(app.calls.length, 0)
  }
  const app = setupRoute()
  assert.equal(
    (await app.POST(app.request(credentials, { 'content-type': 'text/plain' }))).status,
    400,
  )
  assert.equal(app.calls.length, 0)
  assert.equal(
    policy.reviewLoginRequestSchema.safeParse({ ...credentials, password: '가'.repeat(24) })
      .success,
    true,
  )
})

for (const status of [400, 401, 429, 503, 500, 302]) {
  test(`BFF가 상위 서버의 ${status} 오류에서 내부 내용과 비밀번호를 노출하지 않음`, async () => {
    const app = setupRoute(async () =>
      Response.json(
        { message: credentials.password, accessToken: 'leaked', database: 'internal' },
        { status },
      ),
    )
    const response = await app.POST(app.request())
    assert.equal(response.status, [400, 401, 429, 503].includes(status) ? status : 502)
    const body = await response.text()
    assert.equal(body.includes(credentials.password), false)
    assert.equal(body.includes('leaked'), false)
    assert.equal(body.includes('internal'), false)
    assert.match(response.headers.get('cache-control'), /no-store/)
  })
}

test('BFF가 토큰이 없거나 지원하지 않는 역할의 성공 응답을 거부함', async () => {
  for (const body of [
    { success: true },
    { ...session, success: false },
    { ...session, data: { ...session.data, user: { ...session.data.user, role: 'admin' } } },
  ]) {
    const app = setupRoute(async () => Response.json(body))
    const response = await app.POST(app.request())
    assert.equal(response.status, 502)
    assert.equal((await response.text()).includes('access-from-backend'), false)
  }
})

test('BFF가 시간 초과와 통신 오류 및 JSON이 아닌 응답에서도 비밀값을 노출하지 않음', async () => {
  for (const upstream of [
    async () => {
      throw new Error(credentials.password)
    },
    async () => new Response('<html>private</html>'),
  ]) {
    const app = setupRoute(upstream)
    const response = await app.POST(app.request())
    assert.equal(response.status, 503)
    assert.equal((await response.text()).includes(credentials.password), false)
  }
})

test('BFF가 요청 취소를 고정된 상위 서버 요청에 전달함', async () => {
  const app = setupRoute(async (_, options) => {
    assert.equal(options.signal.aborted, true)
    throw options.signal.reason
  })
  const controller = new AbortController()
  const request = new NextRequest('https://pawpong.kr/api/auth/review-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    signal: controller.signal,
  })
  controller.abort()
  assert.equal((await app.POST(request)).status, 503)
})

test('클라이언트가 비밀번호를 POST 본문으로만 전달하고 공통 쿠키 저장을 사용함', async () => {
  const app = setupClient(async () => Response.json(session))
  assert.equal(await app.signInReviewAccount(credentials, new AbortController().signal), true)
  assert.equal(app.calls[0][0], '/api/auth/review-login')
  assert.deepEqual(JSON.parse(app.calls[0][1].body), credentials)
  assert.equal(app.calls[0][1].cache, 'no-store')
  assert.equal(app.saved.length, 1)
  assert.equal(app.saved[0].accessToken, session.data.accessToken)
})

test('클라이언트가 취소와 로그아웃 및 대체된 인증의 쿠키 저장을 차단함', async () => {
  for (const invalidate of ['cancel', 'logout', 'new-login']) {
    let resolve
    const app = setupClient(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const controller = new AbortController()
    const result = app.signInReviewAccount(credentials, controller.signal)
    if (invalidate === 'cancel') controller.abort()
    else if (invalidate === 'logout') app.beginLogout()
    else app.beginLogin()
    resolve(Response.json(session))
    assert.equal(await result, false)
    assert.equal(app.saved.length, 0)
  }
})

test('클라이언트가 실패하거나 잘못된 성공 응답으로 쿠키를 저장하지 않음', async () => {
  for (const upstream of [
    async () => Response.json({ message: credentials.password }, { status: 401 }),
    async () => Response.json({ success: true }),
    async () => {
      throw new Error(credentials.password)
    },
  ]) {
    const app = setupClient(upstream)
    await assert.rejects(
      app.signInReviewAccount(credentials, new AbortController().signal),
      (error) => !error.message.includes(credentials.password),
    )
    assert.equal(app.saved.length, 0)
  }
})

test('복귀 주소가 보호된 내부 목적지를 유지하고 외부 이동을 거부함', () => {
  const { normalizeReturnUrl } = load('src/shared/lib/normalizeReturnUrl.ts')
  assert.equal(normalizeReturnUrl('/account/delete'), '/account/delete')
  for (const path of ['//evil.example', 'https://evil.example', '/\\evil.example'])
    assert.equal(normalizeReturnUrl(path), '/')
})

test('심사 로그인 실패와 취소가 오프라인 로그아웃을 유지하고 이전 계정 복구를 차단함', async () => {
  for (const outcome of ['offline', 'rejected', 'cancelled']) {
    const controller = new AbortController()
    const app = setupClient(async () => {
      if (outcome === 'offline') throw new Error('offline')
      if (outcome === 'cancelled') {
        controller.abort()
        return Response.json(session)
      }
      return new Response('', { status: 401 })
    })
    app.beginLogout()
    const generation = app.getAuthSessionGeneration()
    const attempt = app.signInReviewAccount(credentials, controller.signal)
    if (outcome === 'cancelled') assert.equal(await attempt, false)
    else await assert.rejects(attempt)
    assert.equal(app.hasPendingLogout(), true)
    assert.equal(app.getAuthSessionGeneration(), generation)
    assert.equal(app.isAuthSessionCurrent(), false)
    assert.equal(app.saved.length, 0)
    const recovery = load(
      'src/shared/lib/authSessionRecovery.ts',
      {
        '@/shared/api/token': { getAccessToken: () => null },
        '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
        './authStateEvents': { notifyAuthStateChanged: () => {} },
        './authSessionLifecycle': app,
        './authTokenIdentity': load('src/shared/lib/authTokenIdentity.ts'),
      },
      { fetch: async () => assert.fail('must not refresh logged-out account') },
    )
    assert.equal(await recovery.restoreAuthSession(), null)
  }
})

test('새 심사 로그인 시도가 이전 인증 응답을 대체함', async () => {
  const replies = []
  const app = setupClient(() => new Promise((resolve) => replies.push(resolve)))
  const first = app.signInReviewAccount(credentials, new AbortController().signal)
  const second = app.signInReviewAccount(credentials, new AbortController().signal)
  replies[0](Response.json(session))
  assert.equal(await first, false)
  assert.equal(app.saved.length, 0)
  replies[1](Response.json(session))
  assert.equal(await second, true)
  assert.equal(app.saved.length, 1)
})

test('명시적 로그아웃 후에도 검증된 심사 인증 결과는 쿠키를 저장할 수 있음', async () => {
  const app = setupClient(async () => Response.json(session))
  app.beginLogout()
  assert.equal(await app.signInReviewAccount(credentials, new AbortController().signal), true)
  assert.equal(app.saved.length, 1)
})

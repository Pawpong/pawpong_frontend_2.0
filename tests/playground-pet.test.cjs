const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, deps = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('exports', 'require', code)(exports, (name) => {
    if (!(name in deps)) throw new Error(`Missing dependency ${name}`)
    return deps[name]
  })
  return exports
}

const { isPetEnvironmentAllowed, petExposureMode } = load(
  'src/features/playground-pet/lib/environment.ts',
)
const presentation = load('src/entities/playground-pet/model/presentation.ts')
const { PetCommandQueue } = load('src/entities/playground-pet/model/commandQueue.ts')
const { ApiError, unwrap } = load('src/shared/api/unwrap.ts')
const env = {
  appEnv: 'development',
  enabled: 'true',
  deploymentEnv: 'preview',
  branch: 'dev',
  hostname: 'dev.pawpong.kr',
}
const command = {
  kind: 'actions',
  body: { action: 'feed', expectedRevision: 7, idempotencyKey: 'fixture-request-001' },
}
const view = (revision) => ({
  pet: { id: 'pet-1', revision, level: 3, totalXp: 83, xpForCurrentLevel: 80, xpForNextLevel: 180 },
  serverTime: '2026-10-03T12:00:00.000Z',
})

test('dev host and explicit localhost are allowed without relying on NODE_ENV', () => {
  for (const hostname of [
    'dev.pawpong.kr',
    'localhost:3033',
    '127.0.0.1:3033',
    '10.0.2.2:3033',
    '[::1]:3033',
  ]) {
    assert.equal(isPetEnvironmentAllowed({ ...env, hostname }), true)
  }
})
test('production deployment, branches, unknown hosts and missing flags stay closed', () => {
  for (const patch of [
    { deploymentEnv: 'production' },
    { branch: 'main' },
    { branch: 'master' },
    { appEnv: 'production' },
    { appEnv: undefined },
    { enabled: undefined },
    { enabled: 'false' },
    { enabled: 'TRUE' },
    { hostname: 'pawpong.kr' },
    { hostname: 'www.pawpong.kr' },
    { hostname: 'dev.pawpong.kr.attacker.test' },
    { hostname: 'preview.vercel.app' },
    { hostname: '' },
  ]) {
    assert.equal(isPetEnvironmentAllowed({ ...env, ...patch }), false, JSON.stringify(patch))
  }
})
test('only the real production deployment and canonical host can query the public release gate', () => {
  const production = {
    appEnv: 'production',
    deploymentEnv: 'production',
    branch: 'main',
    hostname: 'pawpong.kr',
  }
  assert.equal(petExposureMode(production), 'public')
  assert.equal(petExposureMode({ ...production, hostname: 'www.pawpong.kr' }), 'public')
  for (const patch of [
    { deploymentEnv: 'preview' },
    { deploymentEnv: undefined },
    { branch: 'dev' },
    { branch: undefined },
    { appEnv: 'development' },
    { hostname: 'localhost:3033' },
    { hostname: 'pawpong.kr.attacker.test' },
    { hostname: 'dev.pawpong.kr' },
  ])
    assert.equal(petExposureMode({ ...production, ...patch }), null)
})
test('NFC names accept 1–12 codepoints but reject blank, controls and invisible format characters', () => {
  assert.equal(presentation.normalizePetName('  도토리  '), '도토리')
  for (const name of ['도', '도토리', '가'.repeat(12), '🐶'.repeat(12)])
    assert.equal(presentation.isValidPetName(name), true)
  for (const name of ['', '  ', '가'.repeat(13), '도\n토리', '도\u200b토리'])
    assert.equal(presentation.isValidPetName(name), false)
})
test('level display uses server thresholds and capped level 10', () => {
  assert.equal(presentation.petLevelProgress(view(1).pet), 3)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, totalXp: 9000 }), 100)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, totalXp: 0 }), 0)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, xpForNextLevel: null }), 100)
})
test('old idempotency receipts cannot overwrite newer state; new revisions replace it', () => {
  const current = view(9)
  assert.equal(presentation.latestPetView(current, view(2)), current)
  assert.equal(presentation.latestPetView(current, view(10)).pet.revision, 10)
  assert.equal(presentation.latestPetView(undefined, view(2)).pet.revision, 2)
})
test('expired display time does not manufacture permission and no-reward actions are explicit', () => {
  assert.equal(
    presentation.remainingSeconds('2026-10-03T12:01:30Z', Date.parse('2026-10-03T12:00:00Z')),
    90,
  )
  assert.equal(
    presentation.remainingSeconds('2026-10-03T12:00:00Z', Date.parse('2026-10-04T12:00:00Z')),
    0,
  )
  assert.match(
    presentation.petActionHint(
      { allowed: false, nextAvailableAt: '2026-10-03T12:00:00Z', reason: 'COOLDOWN' },
      Date.parse('2026-10-04T12:00:00Z'),
    ),
    /확인/,
  )
  assert.match(
    presentation.petActionHint(
      { allowed: true, rewardAvailable: false, nextAvailableAt: '2026-10-04T00:00:00Z' },
      Date.parse('2026-10-03T12:00:00Z'),
    ),
    /경험치 없이/,
  )
})
test('duplicate click sends one request while the original is pending', async () => {
  let resolve,
    count = 0
  const queue = new PetCommandQueue(() => {
    count++
    return new Promise((done) => {
      resolve = done
    })
  })
  const first = queue.run(command)
  assert.deepEqual(await queue.run(command), { type: 'busy' })
  assert.equal(count, 1)
  resolve(view(8))
  assert.equal((await first).type, 'success')
  assert.equal(queue.isRunning, false)
})
test('lost response is retried with identical key/body and blocks replacing the command', async () => {
  const calls = []
  const queue = new PetCommandQueue(async (request) => {
    calls.push(structuredClone(request))
    if (calls.length === 1) throw new ApiError('timeout')
    return { ...view(8), outcome: { action: 'feed', xpAwarded: 10, affinityAwarded: 3 } }
  })
  assert.equal((await queue.run(command)).type, 'uncertain')
  assert.equal(
    (await queue.run({ ...command, body: { ...command.body, action: 'play' } })).type,
    'busy',
  )
  assert.equal(calls.length, 1)
  assert.equal((await queue.run()).data.outcome.xpAwarded, 10)
  assert.deepEqual(calls[1], calls[0])
})
test('5xx retains the original command; a definite 409 allows a fresh revision/key', async () => {
  const calls = []
  const queue = new PetCommandQueue(async (request) => {
    calls.push(request)
    if (calls.length === 1) throw new ApiError('upstream error', 503)
    if (calls.length === 2) throw new ApiError('REVISION_CONFLICT', 409)
    return view(12)
  })
  assert.equal((await queue.run(command)).type, 'uncertain')
  assert.equal((await queue.run()).type, 'rejected')
  const fresh = {
    kind: 'actions',
    body: { action: 'feed', expectedRevision: 11, idempotencyKey: 'new-request-key' },
  }
  assert.equal((await queue.run(fresh)).type, 'success')
  assert.equal(calls[2], fresh)
})
test('API sends the documented URLs and exact mutation body without client rewards or image URL', async () => {
  const calls = []
  const response = { data: { success: true, data: view(8) } }
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': {
      API_VERSION: '/api/v2',
      apiClient: {
        get: async (...args) => {
          calls.push(['GET', ...args])
          return response
        },
        post: async (...args) => {
          calls.push(['POST', ...args])
          return response
        },
      },
    },
    '@/shared/api/unwrap': { ApiError, unwrap },
    '@/shared/api/token': { getAccessToken: () => 'fixture-pet-session' },
  })
  await api.getPet()
  await api.getEligiblePetImages('page-2')
  await api.runPetCommand(command)
  const adopt = {
    kind: 'adopt',
    body: { name: '도토리', sourceJobId: 'source-1', idempotencyKey: 'adopt-request-key' },
  }
  await api.runPetCommand(adopt)
  assert.equal(calls[0][1], '/api/v2/playground/pet/me')
  assert.equal(calls[1][1], '/api/v2/playground/pet/eligible-images')
  assert.equal(calls[1][2].params.cursor, 'page-2')
  assert.deepEqual(calls[2].slice(0, 3), ['POST', '/api/v2/playground/pet/actions', command.body])
  assert.deepEqual(calls[3].slice(0, 3), ['POST', '/api/v2/playground/pet/adopt', adopt.body])
})
test('eligibility follows server cursor pages and never trusts an input URL or filter name', async () => {
  const cursors = []
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': {
      API_VERSION: '/api/v2',
      apiClient: {
        get: async (_url, options) => {
          cursors.push(options.params?.cursor ?? null)
          return {
            data: {
              success: true,
              data: options.params?.cursor
                ? { images: [{ sourceJobId: 'allowed' }], nextCursor: null }
                : { images: [], nextCursor: 'page2' },
            },
          }
        },
      },
    },
    '@/shared/api/unwrap': { ApiError, unwrap },
    '@/shared/api/token': { getAccessToken: () => 'fixture-pet-session' },
  })
  assert.equal(await api.isEligiblePetImage('allowed'), true)
  assert.deepEqual(cursors, [null, 'page2'])
  assert.equal(await api.isEligiblePetImage('arbitrary-url'), false)
})
test('a session change while awaiting a private response rejects the old account data', async () => {
  let token = 'first-session'
  const auth = load('src/features/playground-pet/lib/usePetSession.ts', {
    react: {},
    '@/shared/api/token': { getAccessToken: () => token },
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authStateEvents': { AUTH_STATE_CHANGED: 'auth', notifyAuthStateChanged() {} },
    '@/shared/lib/authSessionRecovery': { refreshAuthSession: async () => token },
    '@/shared/lib/authSessionLifecycle': {
      getAuthSessionGeneration: () => 1,
      isAuthSessionCurrent: (generation) => generation === 1,
    },
  })
  const session = { token, scope: 'owner-a:adopter', generation: 1 }
  await assert.rejects(
    auth.inPetSession(session, async () => {
      token = 'second-session'
      return view(1)
    }),
    (error) => error.status === 401,
  )
  let sent = false
  await assert.rejects(
    auth.inPetSession(session, async () => {
      sent = true
    }),
    (error) => error.status === 401,
  )
  assert.equal(sent, false)
})

function petSessionHarness() {
  const state = { token: 'fixture-account-a', generation: 1, refreshes: 0, notifications: 0 }
  const lifecycle = {
    getAuthSessionGeneration: () => state.generation,
    isAuthSessionCurrent: (generation) => generation === state.generation,
  }
  const token = { getAccessToken: () => state.token }
  const recovery = {
    refreshAuthSession: async () => {
      state.refreshes++
      return state.token
    },
  }
  const { apiClient } = load('src/shared/api/client.ts', {
    axios: require('axios'),
    './unwrap': { ApiError },
    './token': token,
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/config/apiBaseUrl': { getApiBaseUrl: () => 'http://fixture.invalid' },
  })
  const api = load('src/entities/playground-pet/api/pet.api.ts', {
    '@/shared/api/client': { apiClient, API_VERSION: '/api/v2' },
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError, unwrap },
  })
  const auth = load('src/features/playground-pet/lib/usePetSession.ts', {
    react: {},
    '@/shared/api/token': token,
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authStateEvents': {
      AUTH_STATE_CHANGED: 'auth',
      notifyAuthStateChanged: () => state.notifications++,
    },
    '@/shared/lib/authSessionLifecycle': lifecycle,
    '@/shared/lib/authSessionRecovery': recovery,
  })
  return {
    state,
    apiClient,
    api,
    auth,
    recovery,
    session: { token: state.token, generation: 1, scope: 'fixture-account-a' },
  }
}

test('a delayed 401 never refreshes and replays an old pet mutation under the new account', async () => {
  const { state, apiClient, api, auth, session } = petSessionHarness()
  const owners = []
  let rejectFirst, announceStarted
  const started = new Promise((resolve) => (announceStarted = resolve))
  apiClient.defaults.adapter = async (config) => {
    owners.push(config.headers.Authorization === 'Bearer fixture-account-a' ? 'a' : 'b')
    announceStarted()
    return new Promise((_resolve, reject) => {
      rejectFirst = () =>
        reject(
          new (require('axios').AxiosError)('expired', 'ERR_BAD_REQUEST', config, null, {
            status: 401,
            data: { message: '인증이 필요합니다.' },
            config,
          }),
        )
    })
  }
  const pending = auth.inPetSession(session, () => api.runPetCommand(command))
  const rejection = assert.rejects(pending, { status: 401 })
  await started
  state.token = 'fixture-account-b'
  state.generation++
  rejectFirst()
  await rejection
  assert.deepEqual(owners, ['a'])
  assert.equal(state.refreshes, 0)
})

test('a queued Axios request stays bound to its owner when the account changes before dispatch', async () => {
  const { state, apiClient, api, auth, session } = petSessionHarness()
  const owners = []
  apiClient.defaults.adapter = async (config) => {
    owners.push(config.headers.Authorization === 'Bearer fixture-account-a' ? 'a' : 'b')
    return { status: 200, data: { success: true, data: view(8) }, config, headers: {} }
  }
  const pending = auth.inPetSession(session, () => api.runPetCommand(command))
  state.token = 'fixture-account-b'
  state.generation++
  await assert.rejects(pending, { status: 401 })
  assert.deepEqual(owners, ['a'])
  assert.equal(state.notifications, 1)
})

test('a current-account 401 recovers credentials without replaying the rejected command', async () => {
  const { state, apiClient, api, auth, session, recovery } = petSessionHarness()
  const calls = []
  recovery.refreshAuthSession = async () => {
    state.refreshes++
    state.token = 'fixture-account-a-refreshed'
    return state.token
  }
  apiClient.defaults.adapter = async (config) => {
    calls.push({ method: config.method, path: config.url })
    if (config.headers.Authorization === 'Bearer fixture-account-a')
      throw new (require('axios').AxiosError)('expired', 'ERR_BAD_REQUEST', config, null, {
        status: 401,
        data: { message: '인증이 필요합니다.' },
        config,
      })
    return { status: 200, data: { success: true, data: view(8) }, config, headers: {} }
  }
  await assert.rejects(
    auth.inPetSession(session, () => api.runPetCommand(command)),
    { status: 401 },
  )
  assert.equal(state.refreshes, 1)
  assert.equal(state.notifications, 1)
  assert.equal(auth.petSessionIsCurrent(session), false)
  assert.equal(calls.length, 1)
  const fresh = { ...session, token: state.token, scope: 'fixture-refreshed-account-a' }
  assert.equal((await auth.inPetSession(fresh, () => api.getPet())).pet.revision, 8)
  assert.deepEqual(
    calls.map((c) => c.method),
    ['post', 'get'],
  )
})

test('a rejected refresh invalidates the current session without replaying its pet request', async () => {
  const { state, apiClient, api, auth, session, recovery } = petSessionHarness()
  let sent = 0
  recovery.refreshAuthSession = async () => {
    state.refreshes++
    state.token = null
    throw new ApiError('세션 만료', 401)
  }
  apiClient.defaults.adapter = async (config) => {
    sent++
    throw new (require('axios').AxiosError)('expired', 'ERR_BAD_REQUEST', config, null, {
      status: 401,
      data: { message: '인증이 필요합니다.' },
      config,
    })
  }
  await assert.rejects(
    auth.inPetSession(session, () => api.getPet()),
    { status: 401 },
  )
  assert.equal(auth.petSessionIsCurrent(session), false)
  assert.equal(state.notifications, 1)
  assert.equal(state.refreshes, 1)
  assert.equal(sent, 1)
})

test('all eligibility cursor pages use one originating session and discard data after an account switch', async () => {
  const { state, apiClient, api, auth, session } = petSessionHarness()
  const owners = []
  apiClient.defaults.adapter = async (config) => {
    owners.push(config.headers.Authorization === 'Bearer fixture-account-a' ? 'a' : 'b')
    const first = owners.length === 1
    if (first) {
      state.token = 'fixture-account-b'
      state.generation++
    }
    return {
      status: 200,
      data: {
        success: true,
        data: first
          ? { images: [], nextCursor: 'second-page' }
          : { images: [{ sourceJobId: 'eligible-a' }], nextCursor: null },
      },
      config,
      headers: {},
    }
  }
  await assert.rejects(
    auth.inPetSession(session, () => api.isEligiblePetImage('eligible-a')),
    {
      status: 401,
    },
  )
  assert.deepEqual(owners, ['a', 'a'])
})

test('silent cookie expiry releases the care controls and notifies the session without sending a mutation', async () => {
  const { state, auth, session } = petSessionHarness()
  const slots = []
  let cursor = 0,
    sent = 0,
    cached = 0
  const react = {
    useEffect() {},
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [
        slots[index],
        (value) => (slots[index] = typeof value === 'function' ? value(slots[index]) : value),
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
  }
  const { usePetController } = load('src/features/playground-pet/lib/usePetController.ts', {
    react,
    '@tanstack/react-query': {
      useQuery: () => ({ data: view(7), refetch: async () => {} }),
      useQueryClient: () => ({
        cancelQueries: async () => {},
        removeQueries() {},
        invalidateQueries() {},
        setQueryData: () => cached++,
      }),
    },
    '@/entities/playground-pet': {
      ...presentation,
      getPet() {},
      getPetConfig() {},
      runPetCommand: async () => sent++,
    },
    '@/entities/playground-pet/model/commandQueue': { PetCommandQueue },
    './usePetSession': auth,
  })
  const controller = usePetController(session)
  state.token = null
  await controller.execute(command)
  cursor = 0
  assert.equal(usePetController(session).busy, false)
  assert.equal(sent, 0)
  assert.equal(cached, 0)
  assert.equal(state.notifications, 1)
})

test('config route does not contact any backend when the frontend environment is closed', async () => {
  const originalFetch = global.fetch
  let calls = 0
  global.fetch = async () => {
    calls++
    throw new Error('must not fetch')
  }
  try {
    const { GET } = load('src/app/api/playground/pet/config/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
      '@/features/playground-pet/lib/server': load('src/features/playground-pet/lib/server.ts', {
        'server-only': {},
        './environment': {
          petExposureMode: ({ hostname }) => petExposureMode({ ...env, hostname }),
        },
      }),
    })
    // A reverse proxy may expose an internal localhost URL with a production Host.
    const response = await GET({
      nextUrl: new URL('http://localhost/api/playground/pet/config'),
      headers: new Headers({ host: 'pawpong.kr' }),
    })
    assert.deepEqual(response.body, { enabled: false })
    assert.equal(response.headers['Cache-Control'], 'private, no-store')
    assert.equal(calls, 0)
  } finally {
    global.fetch = originalFetch
  }
})
test('same-token login generations get separate caches and logout immediately closes the session', () => {
  let generation = 1
  let current = true
  const token = `header.${Buffer.from(JSON.stringify({ sub: 'owner', role: 'adopter', iat: 1, exp: 9 })).toString('base64url')}.signature`
  const auth = load('src/features/playground-pet/lib/usePetSession.ts', {
    react: {
      useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
      useMemo: (fn) => fn(),
    },
    '@/shared/api/token': { getAccessToken: () => token },
    '@/shared/api/unwrap': { ApiError },
    '@/shared/lib/authStateEvents': { AUTH_STATE_CHANGED: 'auth', notifyAuthStateChanged() {} },
    '@/shared/lib/authSessionRecovery': { refreshAuthSession: async () => token },
    '@/shared/lib/authSessionLifecycle': {
      getAuthSessionGeneration: () => generation,
      isAuthSessionCurrent: (expected) => current && generation === expected,
    },
  })
  const first = auth.usePetSession()
  generation++
  const second = auth.usePetSession()
  assert.equal(first.token, second.token)
  assert.notEqual(first.scope, second.scope)
  assert.equal(auth.petSessionIsCurrent(first), false)
  current = false
  assert.equal(auth.usePetSession(), null)
})
test('backend 404 is a safe disabled config; backend failures are retryable 503', async () => {
  const originalFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://dev-api.example.test'
  try {
    const { GET } = load('src/app/api/playground/pet/config/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
      '@/features/playground-pet/lib/server': load('src/features/playground-pet/lib/server.ts', {
        'server-only': {},
        './environment': { petExposureMode: () => 'development' },
      }),
    })
    for (const status of [404, 503]) {
      global.fetch = async () => ({ status, ok: false })
      const result = await GET({ headers: new Headers({ host: 'localhost' }) })
      assert.equal(result.body.enabled, false)
      assert.equal(result.status, status === 404 ? undefined : 503)
    }
  } finally {
    global.fetch = originalFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})

test('production rejects developer preview and defaults; only explicit public server approval opens', async () => {
  const oldFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://production-api.example.test'
  const server = load('src/features/playground-pet/lib/server.ts', {
    'server-only': {},
    './environment': { petExposureMode: () => 'public' },
  })
  try {
    for (const data of [
      {},
      { enabled: true },
      { enabled: true, publicEnabled: false },
      { enabled: false, publicEnabled: true },
      { enabled: true, publicEnabled: 'true' },
    ]) {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data }),
      })
      assert.equal(await server.isPetServerEnabled('pawpong.kr'), false)
    }
    let options
    global.fetch = async (_url, init) => {
      options = init
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            enabled: true,
            publicEnabled: true,
            policyVersion: 'v1',
            privateAudit: 'must-not-expose',
          },
        }),
      }
    }
    assert.deepEqual((await server.getPetServerConfig('pawpong.kr')).config, {
      enabled: true,
      publicEnabled: true,
      policyVersion: 'v1',
    })
    assert.equal(options.cache, 'no-store')
    global.fetch = async () => {
      throw new Error('backend unavailable')
    }
    assert.equal(await server.isPetServerEnabled('pawpong.kr'), false)
  } finally {
    global.fetch = oldFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})

test('existing development config remains a private preview while its public release is off', async () => {
  const oldFetch = global.fetch
  const oldBase = process.env.NEXT_PUBLIC_API_BASE_URL
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://dev-api.example.test'
  const server = load('src/features/playground-pet/lib/server.ts', {
    'server-only': {},
    './environment': { petExposureMode: () => 'development' },
  })
  try {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { enabled: true, publicEnabled: false },
      }),
    })
    assert.deepEqual((await server.getPetServerConfig('localhost:3033')).config, {
      enabled: true,
      publicEnabled: false,
    })
  } finally {
    global.fetch = oldFetch
    if (oldBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = oldBase
  }
})

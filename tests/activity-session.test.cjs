const test = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { QueryClient, MutationObserver } = require('@tanstack/react-query')
const { AxiosError } = require('axios')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')
const { requestAuthFixture } = require('./fixtures/request-auth.fixture.cjs')

const jwt = (sub, revision) =>
  `fixture.${Buffer.from(JSON.stringify({ sub, role: 'adopter', iat: revision })).toString('base64url')}.fixture`
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function apiHarness() {
  let token = jwt('account-a', 1)
  let generation = 1
  let refreshes = 0
  let notifications = 0
  const auth = {
    getAuthSessionGeneration: () => generation,
    isAuthSessionCurrent: (value) => generation === value,
  }
  const tokens = { getAccessToken: () => token }
  const recovery = {
    refreshAuthSession: async () => {
      refreshes++
      token = jwt('account-a', 2)
      return token
    },
  }
  const unwrap = load('src/shared/api/unwrap.ts')
  const { apiClient, API_VERSION } = load('src/shared/api/client.ts', {
    './unwrap': unwrap,
    './token': tokens,
    './requestAuthScope': requestAuthFixture(tokens, auth),
    '@/shared/lib/authSessionLifecycle': auth,
    '@/shared/lib/authSessionRecovery': recovery,
    '@/shared/config/apiBaseUrl': { getApiBaseUrl: () => 'https://api.invalid' },
    '@/shared/config/apiDiagnosticRoutes': { API_DIAGNOSTIC_ROUTES: [] },
  })
  const sessions = load('src/entities/gamification/model/session.ts', {
    '@/shared/api/token': tokens,
    '@/shared/lib/authSessionLifecycle': auth,
  })
  const api = load('src/entities/gamification/api/activity.api.ts', {
    '@/shared/api': { apiClient, API_VERSION, unwrap: unwrap.unwrap },
    '@/shared/api/unwrap': unwrap,
    '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => notifications++ },
    '@/shared/lib/authSessionRecovery': recovery,
    '../model/session': sessions,
  })
  return {
    api,
    apiClient,
    sessions,
    setToken: (value) => {
      token = value
    },
    nextGeneration: () => generation++,
    get refreshes() {
      return refreshes
    },
    get notifications() {
      return notifications
    },
  }
}

const unauthorized = (config) => {
  throw new AxiosError('expired fixture', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    data: { message: 'expired fixture' },
    config,
    headers: {},
    statusText: 'Unauthorized',
  })
}

test('실제 Axios 인터셉터에서도 이전 계정의 401 쓰기를 새 계정으로 재전송하지 않는다', async () => {
  for (const operation of ['sync', 'display']) {
    const h = apiHarness()
    const session = h.sessions.getActivitySession()
    const calls = []
    h.apiClient.defaults.adapter = async (config) => {
      calls.push(config)
      h.setToken(jwt('account-b', 1)) // another tab can change the cookie without this document's generation
      return unauthorized(config)
    }
    await assert.rejects(
      operation === 'sync'
        ? h.api.synchronizeActivity(session)
        : h.api.displayActivityBadges(session, ['first_step']),
    )
    assert.equal(calls.length, 1)
    assert.equal(calls[0].headers.Authorization, `Bearer ${session.token}`)
    assert.equal(calls[0].skipAuthRefresh, true)
    assert.equal(h.refreshes, 0)
    assert.ok(h.notifications > 0)
  }
})

test('Axios가 비동기 요청을 실행하기 전 쿠키가 바뀌어도 원래 인증을 사용한다', async () => {
  const h = apiHarness()
  const session = h.sessions.getActivitySession()
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    assert.equal(config.headers.Authorization, `Bearer ${session.token}`)
    return { status: 200, data: { success: true, data: { totalExp: 10 } }, config }
  }
  const pending = h.api.displayActivityBadges(session, ['first_step'])
  h.setToken(jwt('account-b', 1))
  await assert.rejects(pending, /계정이 변경/)
  assert.equal(calls, 1)
  await assert.rejects(h.api.synchronizeActivity(session), /로그인/)
  assert.equal(calls, 1)
})

test('일반 401은 인증만 갱신하고 새 범위에서 조회하며 쓰기를 자동 재실행하지 않는다', async () => {
  const h = apiHarness()
  const original = h.sessions.getActivitySession()
  assert.equal(h.sessions.getActivitySession(), original)
  let writes = 0
  h.apiClient.defaults.adapter = async (config) => {
    if (config.method === 'patch') {
      writes++
      return unauthorized(config)
    }
    return { status: 200, data: { success: true, data: { totalExp: 30 } }, config }
  }
  await assert.rejects(h.api.displayActivityBadges(original, ['first_step']))
  const renewed = h.sessions.getActivitySession()
  assert.equal(h.refreshes, 1)
  assert.equal(writes, 1)
  assert.equal(renewed.ownerId, original.ownerId)
  assert.notEqual(renewed.scope, original.scope)
  assert.ok(!renewed.scope.includes(renewed.token))
  assert.deepEqual(await h.api.getActivity(renewed), { totalExp: 30 })
})

test('다른 요청의 정상 토큰 갱신도 새 배지함 범위를 만들어 이전 응답을 분리한다', async () => {
  const h = apiHarness()
  const original = h.sessions.getActivitySession()
  const response = deferred()
  h.apiClient.defaults.adapter = async (config) => {
    await response.promise
    return { status: 200, data: { success: true, data: { totalExp: 50 } }, config }
  }
  const pending = h.api.getActivity(original)
  h.setToken(jwt('account-a', 2))
  response.resolve()
  await assert.rejects(pending, /계정이 변경/)
  const renewed = h.sessions.getActivitySession()
  assert.notEqual(renewed.scope, original.scope)
  assert.deepEqual(await h.api.getActivity(renewed), { totalExp: 50 })
  h.nextGeneration()
  assert.notEqual(h.sessions.getActivitySession().scope, renewed.scope)
  h.setToken(null)
  assert.equal(h.sessions.getActivitySession(), null)
})

function dashboardHarness(api) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const session = {
    token: 'fixture',
    generation: 1,
    scope: 'dashboard-fixture',
    ownerId: 'fixture-user',
  }
  const key = ['gamification', 'private', session.scope]
  const observers = []
  let cursor = 0
  let queryOptions
  let refetches = 0
  const view = {
    data: { totalExp: 0, displayBadges: [], badges: [], history: [] },
    refetch: async () => {
      refetches++
      return { isSuccess: true }
    },
  }
  const { ActivityDashboard } = load('src/features/gamification/ui/ActivityDashboard.tsx', {
    '@tanstack/react-query': {
      useQueryClient: () => client,
      useIsMutating: (filter) => client.isMutating(filter),
      // 대시보드는 활동 조회와 레벨표(catalog) 조회를 함께 쓴다. 레벨표는 아직 오지 않은 상태로 둔다.
      useQuery: (options) => {
        if (options.queryKey[1] === 'catalog') return { data: undefined }
        queryOptions = options
        return view
      },
      useMutation: (options) => {
        const index = cursor++
        observers[index] ??= new MutationObserver(client, options)
        observers[index].setOptions(options)
        return observers[index].getCurrentResult()
      },
    },
    '@/entities/gamification': api,
    '@/shared/ui': {
      Button: ({ children, ...props }) => React.createElement('button', props, children),
    },
    '@/shared/lib/fonts': { cafe24Proup: { className: '' } },
    './activity.module.css': { default: {} },
  })
  const render = () => {
    cursor = 0
    return ActivityDashboard({ session })
  }
  render()
  return {
    client,
    key,
    session,
    observers,
    render,
    view,
    get options() {
      return queryOptions
    },
    get refetches() {
      return refetches
    },
  }
}

test('동기화와 배지 저장 전후의 오래된 조회가 저장된 선택을 덮어쓰지 않는다', async () => {
  for (const operation of [0, 1]) {
    const writes = deferred()
    const h = dashboardHarness({
      synchronizeActivity: () => writes.promise,
      displayActivityBadges: () => writes.promise,
    })
    const before = deferred()
    const during = deferred()
    const original = { displayBadges: ['first_step'], totalExp: 10 }
    const saved = { displayBadges: ['first_story'], totalExp: 20 }
    h.client.setQueryData(h.key, original)
    const first = h.client
      .fetchQuery({ queryKey: h.key, queryFn: () => before.promise })
      .catch(() => {})
    const mutation = h.observers[operation].mutate(['first_story'])
    await new Promise((done) => setImmediate(done))
    h.render()
    assert.equal(h.options.enabled, false)
    // Simulate an independently initiated refetch during the mutation as well.
    const second = h.client
      .fetchQuery({ queryKey: h.key, queryFn: () => during.promise })
      .catch(() => {})
    writes.resolve(saved)
    await mutation
    before.resolve(original)
    during.resolve(original)
    await Promise.all([first, second])
    assert.deepEqual(h.client.getQueryData(h.key), saved)
    h.render()
    assert.equal(h.options.enabled, true)
    h.client.clear()
  }
})

function findNode(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (predicate(node)) return node
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findNode(child, predicate)
    if (found) return found
  }
  return null
}

test('동기화와 배지 저장 오류는 조회 복구 성공 뒤 모두 사라진다', async () => {
  const h = dashboardHarness({
    synchronizeActivity: async () => {
      throw new Error('fixture sync failure')
    },
    displayActivityBadges: async () => {
      throw new Error('fixture display failure')
    },
  })
  await h.observers[0].mutate().catch(() => {})
  await h.observers[1].mutate([]).catch(() => {})
  assert.ok(findNode(h.render(), (node) => node.props?.role === 'alert'))
  const button = findNode(h.render(), (node) => node.props?.children === '다시 확인')
  await button.props.onClick()
  assert.equal(h.refetches, 1)
  assert.equal(h.observers[0].getCurrentResult().status, 'idle')
  assert.equal(h.observers[1].getCurrentResult().status, 'idle')
  assert.equal(
    findNode(h.render(), (node) => node.props?.role === 'alert'),
    null,
  )
  h.client.clear()
})

test('정상 토큰 회전은 마이홈 활동 탭의 대시보드 key를 바꿔 재조회한다', () => {
  const h = apiHarness()
  const { MyHomeActivity } = load('src/features/gamification/ui/MyHomeActivity.tsx', {
    '@tanstack/react-query': { useQuery: () => ({ data: { enabled: true } }) },
    '@/entities/gamification': { activityConfigOptions: {} },
    '../lib/useActivitySession': { useActivitySession: h.sessions.getActivitySession },
    './ActivityDashboard': { ActivityDashboard: () => null },
  })
  const first = MyHomeActivity({ userId: 'account-a' })
  h.setToken(jwt('account-a', 2))
  const second = MyHomeActivity({ userId: 'account-a' })
  assert.notEqual(first.key, second.key)
  assert.equal(second.props.session.ownerId, 'account-a')
  h.setToken(jwt('account-b', 2))
  // 아직 A의 프로필을 보고 있는 마이홈에 B의 활동을 붙이지 않는다.
  assert.equal(MyHomeActivity({ userId: 'account-a' }), null)
})

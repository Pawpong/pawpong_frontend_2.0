const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const configRoute = (fetch, base = 'https://api.example.test/') =>
  load(
    'src/app/api/gamification/config/route.ts',
    {},
    { process: { env: base ? { NEXT_PUBLIC_API_BASE_URL: base } : {} }, fetch },
  )

test('활동 설정은 API 주소가 없으면 외부 호출 없이 닫고, 있으면 백엔드 플래그를 그대로 전달한다', async () => {
  const urls = []
  const fetch = async (url) => {
    urls.push(url)
    return Response.json({ success: true, data: { enabled: true, breederLevelPublic: true } })
  }
  const closed = await configRoute(fetch, '').GET()
  assert.deepEqual(await closed.json(), { enabled: false, breederLevelPublic: false })
  assert.match(closed.headers.get('cache-control'), /no-store/)
  assert.equal(urls.length, 0)
  const open = await configRoute(fetch).GET()
  assert.deepEqual(await open.json(), { enabled: true, breederLevelPublic: true })
  assert.match(open.headers.get('cache-control'), /no-store/)
  assert.deepEqual(urls, ['https://api.example.test/api/v2/gamification/config'])
})

test('설정 조회 실패는 활동 UI를 열지 않는다', async () => {
  const response = await configRoute(async () => {
    throw new Error('fixture unavailable')
  }).GET()
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { enabled: false, breederLevelPublic: false })
})

const fixtureSession = {
  token: 'fixture-session',
  generation: 1,
  ownerId: 'fixture-user',
  scope: 'fixture-scope',
}

function activityApi({ request, token = () => 'fixture-session', current = () => true } = {}) {
  return load('src/entities/gamification/api/activity.api.ts', {
    '@/shared/api': {
      apiClient: { get: request },
      API_VERSION: '/v2',
      unwrap: (value) => value.data,
    },
    '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
    '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => {} },
    '@/shared/lib/authSessionRecovery': { refreshAuthSession: async () => {} },
    '../model/session': {
      isActivitySessionCurrent: (session) => current() && token() === session.token,
    },
  })
}

test('대표 배지는 중복 제거와 50명 묶음으로 조회하고 인증을 전달하지 않는다', async () => {
  const calls = []
  const api = activityApi({
    request: async (url, config) => {
      calls.push({ url, config })
      return { data: [] }
    },
  })
  const owners = Array.from({ length: 51 }, (_, i) => ({
    ownerId: i.toString(16).padStart(24, '0'),
    role: 'adopter',
  }))
  await api.getPublicActivityBadges([...owners, owners[0]])
  assert.equal(calls.length, 2)
  assert.equal(calls[0].config.params.owners.split(',').length, 50)
  assert.equal(calls[1].config.params.owners.split(',').length, 1)
  assert.equal(calls[0].config.skipAuth, true)
  assert.equal(calls[0].config.skipAuthRefresh, true)
})

test('계정이 변경되면 늦게 도착한 이전 EXP 응답을 버린다', async () => {
  let token = 'first'
  const api = activityApi({ token: () => token })
  await assert.rejects(
    api.withActivitySession({ ...fixtureSession, token: 'first' }, async () => {
      token = 'second'
      return { totalExp: 100 }
    }),
    /계정이 변경/,
  )
  const missing = activityApi({ token: () => null })
  let requested = false
  await assert.rejects(
    missing.withActivitySession(fixtureSession, async () => {
      requested = true
    }),
    /로그인/,
  )
  assert.equal(requested, false)
})

test('도트 배지는 접근성 이름을 제공하고 커뮤니티에는 최대 세 개만 표시한다', () => {
  const pixel = load('src/entities/gamification/ui/PixelActivityBadge.tsx')
  const row = load('src/entities/gamification/ui/ActivityBadgeRow.tsx', {
    './PixelActivityBadge': pixel,
  })
  const html = renderToStaticMarkup(
    createElement(pixel.PixelActivityBadge, {
      badgeKey: 'first_step',
      title: '첫 발걸음',
      locked: true,
    }),
  )
  assert.match(html, /aria-label="첫 발걸음"/)
  assert.match(html, /crispEdges/)
  assert.match(html, /grayscale/)
  const badges = Array.from({ length: 5 }, (_, i) => ({
    key: String(i),
    title: `활동 ${i}`,
    description: '참여 기록',
    earnedAt: '2026-10-06',
  }))
  const rendered = renderToStaticMarkup(createElement(row.ActivityBadgeRow, { badges }))
  assert.equal((rendered.match(/<svg/g) ?? []).length, 3)
  assert.equal(renderToStaticMarkup(createElement(row.ActivityBadgeRow, { badges: [] })), '')
})

test('선택 배포 전 404는 비활성 설정으로 처리하고 config 오류는 화면 경계로 던지지 않는다', async () => {
  const response = await configRoute(
    async () => new Response('not deployed', { status: 404 }),
  ).GET()
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { enabled: false, breederLevelPublic: false })
  assert.equal(activityApi().activityConfigOptions.throwOnError, false)
})

test('이전 세대의 활동 요청은 시작하거나 결과를 반영하지 않는다', async () => {
  let current = false
  let calls = 0
  const api = activityApi({ current: () => current })
  await assert.rejects(
    api.withActivitySession(fixtureSession, async () => {
      calls++
      return 100
    }),
    /로그인/,
  )
  assert.equal(calls, 0)
  current = true
  await assert.rejects(
    api.withActivitySession(fixtureSession, async () => {
      current = false
      return 100
    }),
    /계정이 변경/,
  )
})

test('내 활동 요청은 서버 점수와 keys 계약을 사용하고 AbortSignal을 전달한다', async () => {
  const calls = []
  const record = async (...args) => {
    calls.push(args)
    return { data: { totalExp: 100 } }
  }
  const api = load('src/entities/gamification/api/activity.api.ts', {
    '@/shared/api': {
      apiClient: { get: record, post: record, patch: record },
      API_VERSION: '/v2',
      unwrap: (r) => r.data,
    },
    '@/shared/api/unwrap': load('src/shared/api/unwrap.ts'),
    '@/shared/lib/authStateEvents': { notifyAuthStateChanged: () => {} },
    '@/shared/lib/authSessionRecovery': { refreshAuthSession: async () => {} },
    '../model/session': { isActivitySessionCurrent: () => true },
  })
  const signal = new AbortController().signal
  await api.getActivity(fixtureSession, signal)
  await api.synchronizeActivity(fixtureSession, signal)
  await api.displayActivityBadges(fixtureSession, ['first_step'], signal)
  assert.equal(calls[0][0], '/v2/gamification/me')
  assert.equal(calls[0][1].signal, signal)
  assert.deepEqual(calls[1].slice(0, 2), ['/v2/gamification/me/sync', {}])
  assert.equal(calls[1][2].signal, signal)
  assert.deepEqual(calls[2].slice(0, 2), [
    '/v2/gamification/me/display-badges',
    { keys: ['first_step'] },
  ])
  assert.equal(calls[2][2].signal, signal)
})

test('설정이 꺼지거나 조회 실패하면 이전 대표 배지 캐시도 숨긴다', () => {
  for (const config of [{ data: { enabled: false } }, { data: { enabled: true }, isError: true }]) {
    const queries = []
    const { usePublicActivityBadges } = load(
      'src/features/gamification/lib/usePublicActivityBadges.ts',
      {
        '@tanstack/react-query': {
          useQuery: (options) => {
            queries.push(options)
            return queries.length === 1 ? config : { data: [{ badges: ['old'] }] }
          },
        },
        '@/entities/gamification': {
          activityConfigOptions: {},
          getPublicActivityBadges: () => {
            throw Error('should not load')
          },
        },
      },
    )
    assert.deepEqual(usePublicActivityBadges([{ ownerId: '1'.repeat(24), role: 'adopter' }]), [])
    assert.equal(queries[1].enabled, false)
  }
})

test('배지함은 획득한 배지만 선택하며 3개 한도에서 추가 선택을 막고 해제는 허용한다', () => {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const badges = [
    'first_step',
    'first_story',
    'story_connector',
    'on_stage',
    'first_introduction',
    'hall_of_fame',
  ].map((key, i) => ({
    key,
    title: `활동 ${i}`,
    description: '<script>not HTML</script>',
    target: 1,
    progress: i < 4 ? 1 : 0,
    state: i < 4 ? 'earned' : i === 4 ? 'locked' : 'revoked',
    earnedAt: i < 4 ? '2026-10-06' : null,
  }))
  client.setQueryData(['gamification', 'private', fixtureSession.scope], {
    totalExp: 155,
    displayBadges: badges.slice(0, 3).map((b) => b.key),
    badges,
    history: [{ at: '2026-10-06', kind: 'comment', delta: -5, reason: 'revoked' }],
    updatedAt: '2026-10-06',
  })
  const { ActivityDashboard } = load('src/features/gamification/ui/ActivityDashboard.tsx', {
    '@/entities/gamification': {
      PixelActivityBadge: () => null,
      BreederLevelBadge: () => null,
      ACTIVITY_LABELS: { comment: '댓글' },
    },
    '@/shared/ui': { Button: (props) => createElement('button', props) },
    '@/shared/lib/fonts': { cafe24Proup: { className: '' } },
    './activity.module.css': { default: {} },
  })
  const html = renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client },
      createElement(ActivityDashboard, { session: fixtureSession }),
    ),
  )
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 3)
  assert.match(html, /aria-pressed="false" disabled=""/)
  assert.equal((html.match(/대표 배지로 쓰기/g) ?? []).length, 1)
  assert.match(html, /관련 활동 변경으로 회수됨/)
  assert.match(html, /-5 EXP/)
  assert.ok(!html.includes('<script>'))
  client.clear()
})

test('마이홈 활동 탭은 비활성·설정 오류·다른 계정 세션에서 개인 대시보드를 마운트하지 않는다', () => {
  const scenarios = [
    { config: { data: { enabled: false } }, session: fixtureSession, userId: 'fixture-user' },
    {
      config: { data: { enabled: true }, isError: true },
      session: fixtureSession,
      userId: 'fixture-user',
    },
    { config: { data: { enabled: true } }, session: null, userId: 'fixture-user' },
    { config: { data: { enabled: true } }, session: fixtureSession, userId: 'previous-account' },
    { config: { data: { enabled: true } }, session: fixtureSession, userId: undefined },
  ]
  const mount = (scenario, dashboard) =>
    load('src/features/gamification/ui/MyHomeActivity.tsx', {
      '@tanstack/react-query': { useQuery: () => scenario.config },
      '@/entities/gamification': { activityConfigOptions: {} },
      '../lib/useActivitySession': { useActivitySession: () => scenario.session },
      './ActivityDashboard': { ActivityDashboard: dashboard },
    }).MyHomeActivity
  for (const scenario of scenarios) {
    const MyHomeActivity = mount(scenario, () => {
      throw new Error('private dashboard must not mount')
    })
    assert.equal(
      renderToStaticMarkup(createElement(MyHomeActivity, { userId: scenario.userId })),
      '',
    )
  }
  const MyHomeActivity = mount(
    { config: { data: { enabled: true } }, session: fixtureSession },
    ({ session }) => createElement('p', null, `dashboard:${session.ownerId}`),
  )
  assert.equal(
    renderToStaticMarkup(createElement(MyHomeActivity, { userId: 'fixture-user' })),
    '<p>dashboard:fixture-user</p>',
  )
})

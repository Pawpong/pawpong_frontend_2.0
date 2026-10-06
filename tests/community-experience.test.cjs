const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextRequest } = require('next/server')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

test('커뮤니티 체험과 AI 설정은 운영에서 닫고 잘못된 개발 응답도 거부한다', async () => {
  let called = false
  const route = load(
    'src/app/api/community/experience/config/route.ts',
    {},
    {
      fetch: async () => {
        called = true
        return Response.json({ success: true, data: { enabled: true } })
      },
    },
  )
  const production = await route.GET(
    new NextRequest('https://pawpong.kr/api/community/experience/config', {
      headers: { host: 'pawpong.kr' },
    }),
  )
  assert.equal(called, false)
  assert.equal((await production.json()).aiEnabled, false)
  const malformed = await route.GET(
    new NextRequest('https://dev.pawpong.kr/api/community/experience/config', {
      headers: { host: 'dev.pawpong.kr' },
    }),
  )
  assert.equal(malformed.status, 503)
  assert.equal((await malformed.json()).enabled, false)
})

test('기존 피드 쿼리 키를 유지하고 새 주제만 선택적으로 추가한다', async () => {
  const calls = []
  const query = load('src/entities/community/api/community.queries.ts', {
    '@/shared/api': {
      createInfiniteQuery: (value) => value,
      createQuery: (value) => value,
      STALE_TIME: {},
    },
    './community.api': { getCommunityPosts: async (value) => calls.push(value) },
  }).communityQueries
  const classic = query.posts('latest', 'dog')
  assert.deepEqual(classic.queryKey, [
    'community',
    'posts',
    'latest',
    'dog',
    undefined,
    undefined,
    15,
  ])
  await classic.queryFn(1)
  assert.equal(Object.hasOwn(calls[0], 'topic'), false)
  const topic = query.posts('latest', 'dog', undefined, '산책', 15, 'walk')
  await topic.queryFn(2)
  assert.equal(calls[1].topic, 'walk')
  assert.equal(calls[1].petType, 'dog')
  assert.equal(calls[1].search, '산책')
})

test('AI 답변 조회는 생성 요청을 하지 않고 생성에는 동의 본문만 전달한다', async () => {
  const calls = []
  const api = load('src/entities/community/api/communityExperience.api.ts', {
    '@/shared/api': {
      apiClient: {
        get: async (...args) => {
          calls.push(['get', ...args])
          return { data: null }
        },
        post: async (...args) => {
          calls.push(['post', ...args])
          return { data: { status: 'pending' } }
        },
      },
      unwrap: (value) => value.data,
      API_VERSION: '/v2',
    },
    '@/shared/api/token': { getAccessToken: () => 'fixture' },
    '@/shared/lib/authSessionLifecycle': { getAuthSessionGeneration: () => 0 },
  })
  await api.readCommunityAiAnswer('fixture-post')
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'get')
  await api.requestCommunityAiAnswer('fixture-post')
  assert.deepEqual(calls[1][2], { consent: true })
  assert.equal(calls[1][3].timeout, 30000)
})

test('AI 답변 화면은 자동 생성 없이 동의를 받고 의학적 참고 경고를 표시한다', () => {
  let mutations = 0
  const values = [
    {
      data: {
        enabled: true,
        aiEnabled: true,
        topics: [],
        aiNotice: '진단과 처방을 대신하지 않습니다.',
      },
    },
    { data: null, isPending: false },
  ]
  const panel = load('src/app/(main)/community/_ui/CommunityExperiencePanel.tsx', {
    '@tanstack/react-query': {
      useQuery: () => values.shift(),
      useQueryClient: () => ({}),
      useMutation: () => ({ mutate: () => mutations++ }),
    },
    '@/entities/community': {
      communityExperienceConfigOptions: {},
      readCommunityAiAnswer: () => null,
    },
    '@/features/care-map': { SharedRouteMap: () => null },
    '@/features/in-app-purchase': { usePurchases: () => ({ generation: 0 }) },
    '@/shared/api/token': { getAccessToken: () => 'fixture' },
    '@/shared/lib/authSessionLifecycle': { isAuthSessionCurrent: () => true },
  })
  const post = {
    postId: 'fixture',
    body: '질문',
    experience: { topics: [], question: true, route: [] },
  }
  const html = renderToStaticMarkup(
    createElement(panel.CommunityExperiencePanel, { post, isOwner: true }),
  )
  assert.equal(mutations, 0)
  assert.match(html, /AI 참고 답변/)
  assert.match(html, /진단과 처방/)
  assert.match(html, /type="checkbox"/)
  assert.match(html, /disabled=""/)
})

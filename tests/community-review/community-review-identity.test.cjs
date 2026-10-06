const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, identity, sessionFixture } = require('./fixtures/community-review.fixture.cjs')
const token = (sub, exp) =>
  `synthetic.${Buffer.from(JSON.stringify({ sub, role: 'adopter', exp })).toString('base64url')}.synthetic`

test('다른 탭의 인증 쿠키 변경도 이전 캐시를 제거하고 동일 쿠키는 반복 갱신하지 않음', () => {
  const changes = []
  let value = 'synthetic-one'
  const create = load('src/shared/lib/authQueryBoundary.ts', {
    './authTokenIdentity': identity,
    './authSessionLifecycle': { getAuthSessionGeneration: () => 1 },
    '@/shared/api/token': { getAccessToken: () => value },
  }).createAuthQueryBoundary
  const boundary = create({
    removeQueries: () => changes.push('inactive'),
    resetQueries: () => changes.push('active'),
  })
  boundary()
  assert.deepEqual(changes, [])
  value = 'synthetic-two'
  boundary()
  boundary()
  assert.deepEqual(changes, ['inactive', 'active'])
})

test('같은 계정의 토큰 갱신은 유지하고 다른 계정과 구분자 충돌은 거부함', () => {
  const { state, session } = sessionFixture()
  state.token = token('synthetic-owner', 1)
  const assertCurrent = session.captureCommunityWriteSession()
  state.token = token('synthetic-owner', 2)
  assertCurrent()
  state.token = token('synthetic-other', 2)
  assert.throws(assertCurrent)
  const make = (sub, role) =>
    `synthetic.${Buffer.from(JSON.stringify({ sub, role })).toString('base64url')}.synthetic`
  assert.notEqual(
    identity.authTokenIdentity(make('x:y', 'adopter')),
    identity.authTokenIdentity(make('y', 'adopter:x')),
  )
})

test('사용자가 취소한 요청은 장애로 수집하지 않고 자동 재시도하지 않음', async () => {
  const query = require('@tanstack/react-query')
  const api = load('src/shared/api/unwrap.ts')
  const captures = []
  const Provider = load('src/shared/lib/QueryProvider.tsx', {
    react: { useState: (init) => [init()], useEffect: () => {} },
    '@tanstack/react-query': query,
    '@tanstack/react-query-devtools': { ReactQueryDevtools: () => null },
    '@/shared/api': { ...api, STALE_TIME: { DEFAULT: 30000 } },
    '@sentry/nextjs': { captureException: (value) => captures.push(value) },
    './authStateEvents': {},
    './authQueryBoundary': {},
  }).QueryProvider
  const client = Provider({ children: null }).props.client
  try {
    const error = new api.ApiError('취소된 합성 요청', undefined, undefined, undefined, {
      method: 'POST',
      endpoint: '/api/v2/community/posts/:id/review',
      transportCode: 'ERR_CANCELED',
    })
    let attempts = 0
    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => {
        attempts++
        throw error
      },
    })
    await assert.rejects(mutation.execute())
    assert.equal(attempts, 1)
    assert.deepEqual(captures, [])
  } finally {
    client.clear()
  }
})

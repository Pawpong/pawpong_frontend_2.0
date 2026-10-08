const { test } = require('node:test')
const assert = require('node:assert/strict')
const { QueryClient, QueryObserver } = require('@tanstack/react-query')
const {
  load,
  sessionFixture,
  deferred,
  post,
  identity,
} = require('./fixtures/community-review.fixture.cjs')

test('세션 경계는 취소와 토큰 또는 계정 세대 변경을 모두 거부함', () => {
  const { state, session } = sessionFixture()
  const controller = new AbortController()
  const assertCurrent = session.captureCommunityWriteSession(controller.signal)
  assertCurrent()
  controller.abort()
  assert.throws(assertCurrent)
  const valid = session.captureCommunityWriteSession()
  state.token = 'other-synthetic'
  assert.throws(valid)
  state.token = null
  assert.throws(() => session.captureCommunityWriteSession())
})
test('중복 제출은 한 번만 실행하고 화면 이탈 후 완료는 캐시와 오류에 반영하지 않음', async () => {
  const { session } = sessionFixture()
  const wait = deferred()
  const cleanups = [],
    errors = [],
    updates = []
  let calls = 0
  const hook = load('src/features/community/lib/useSubmitCommunityPostForm.ts', {
    react: {
      useRef: (value) => ({ current: value }),
      useState: (initial) => [
        initial,
        (value) => {
          if (initial === null) errors.push(value)
        },
      ],
      useEffect: (effect) => cleanups.push(effect()),
    },
    '@tanstack/react-query': {
      useQueryClient: () => ({}),
      useMutation: (options) => ({ mutateAsync: options.mutationFn, isPending: false }),
    },
    '@/shared/lib/useAccessToken': { useAccessToken: () => 'synthetic-token' },
    './submitCommunityPostForm': {
      submitCommunityPostForm: async () => {
        calls++
        return wait.promise
      },
    },
    './communityWriteSession': session,
    '../api/community.cache': {
      invalidateCommunityPostLists: async () => updates.push('list'),
      invalidateCommunityPostData: async () => updates.push('detail'),
    },
  }).useSubmitCommunityPostForm()
  const first = hook.submit({})
  assert.equal(await hook.submit({}), null)
  assert.equal(calls, 1)
  cleanups[0]()
  wait.resolve(post())
  assert.equal(await first, null)
  assert.deepEqual(updates, [])
  assert.deepEqual(errors, [null])
})
test('재심사 화면 이탈 후 늦은 응답은 상세 캐시와 목록을 갱신하지 않음', async () => {
  const { session } = sessionFixture()
  const wait = deferred(),
    cleanups = [],
    updates = []
  const mutation = load('src/features/community/lib/useCommunityReviewRequest.ts', {
    react: {
      useRef: (value) => ({ current: value }),
      useEffect: (effect) => cleanups.push(effect()),
    },
    '@tanstack/react-query': {
      useQueryClient: () => ({ setQueryData: () => updates.push('cache') }),
      useMutation: (options) => options,
    },
    '@/entities/community': { communityQueries: { detailKey: () => [] } },
    '@/shared/lib/useAccessToken': { useAccessToken: () => 'synthetic-token' },
    '../api/communityReview.api': { requestCommunityPostReview: () => wait.promise },
    '../api/community.cache': { invalidateCommunityPostData: async () => updates.push('list') },
    './communityWriteSession': session,
  }).useCommunityReviewRequest('synthetic-post')
  assert.equal(mutation.retry, false)
  const pending = mutation.mutationFn(true)
  cleanups[0]()
  wait.resolve(post())
  await assert.rejects(pending)
  assert.deepEqual(updates, [])
})

test('완료 결과로 패널이 교체되어도 성공을 취소로 오인하지 않음', async () => {
  const { session } = sessionFixture()
  const cleanups = [],
    updates = []
  const mutation = load('src/features/community/lib/useCommunityReviewRequest.ts', {
    react: {
      useRef: (value) => ({ current: value }),
      useEffect: (effect) => cleanups.push(effect()),
    },
    '@tanstack/react-query': {
      useQueryClient: () => ({
        setQueryData: () => {
          updates.push('cache')
          cleanups[0]()
        },
      }),
      useMutation: (options) => options,
    },
    '@/entities/community': { communityQueries: { detailKey: () => [] } },
    '@/shared/lib/useAccessToken': { useAccessToken: () => 'synthetic-token' },
    '../api/communityReview.api': { requestCommunityPostReview: async () => post() },
    '../api/community.cache': { invalidateCommunityPostData: async () => updates.push('list') },
    './communityWriteSession': session,
  }).useCommunityReviewRequest('synthetic-post')
  assert.equal((await mutation.mutationFn(true)).postId, 'synthetic-post')
  assert.deepEqual(updates, ['cache', 'list'])
})
test('계정 전환은 이전 비활성 캐시와 진행 중 응답을 제거하고 새 계정으로 조회함', async () => {
  const wait = deferred()
  let generation = 1,
    calls = 0
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const observer = new QueryObserver(client, {
    queryKey: ['community', 'detail', 'synthetic'],
    queryFn: () => (++calls === 1 ? wait.promise : Promise.resolve('새 계정 자료')),
  })
  const unsubscribe = observer.subscribe(() => {})
  const boundary = load('src/shared/lib/authQueryBoundary.ts', {
    './authTokenIdentity': identity,
    '@/shared/api/token': { getAccessToken: () => 'synthetic-token' },
    './authSessionLifecycle': { getAuthSessionGeneration: () => generation },
  }).createAuthQueryBoundary(client)
  try {
    client.setQueryData(['community', 'old-private'], '이전 작성자 비공개 자료')
    boundary()
    assert.equal(client.getQueryData(['community', 'old-private']), '이전 작성자 비공개 자료')
    generation++
    boundary()
    assert.equal(client.getQueryData(['community', 'old-private']), undefined)
    await new Promise((resolve) => setTimeout(resolve, 0))
    wait.resolve('이전 작성자의 늦은 응답')
    await new Promise((resolve) => setTimeout(resolve, 0))
    assert.equal(client.getQueryData(['community', 'detail', 'synthetic']), '새 계정 자료')
    assert.equal(calls, 2)
  } finally {
    unsubscribe()
    observer.destroy()
    client.clear()
  }
})

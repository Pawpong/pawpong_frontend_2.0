const { test, assert, load, ApiError, unwrap } = require('./fixtures/core.fixture.cjs')

test('같은 토큰이어도 새 로그인은 캐시를 분리하고 로그아웃은 세션을 즉시 닫음', () => {
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

const {
  test,
  assert,
  load,
  ApiError,
  unwrap,
  command,
  view,
} = require('./fixtures/core.fixture.cjs')
const { petSessionHarness } = require('./fixtures/session.fixture.cjs')

test('개인 응답 대기 중 세션이 바뀌면 이전 계정 자료를 거부함', async () => {
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

test('늦은 인증 실패는 새 계정에서 이전 돌봄 명령을 갱신하거나 재전송하지 않음', async () => {
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

test('요청 직후 계정이 바뀌면 원래 인증만 사용하고 세션 변경을 알림', async () => {
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

const {
  test,
  assert,
  load,
  ApiError,
  presentation,
  PetCommandQueue,
  command,
  view,
} = require('./fixtures/core.fixture.cjs')
const { petSessionHarness } = require('./fixtures/session.fixture.cjs')

test('현재 계정의 인증 만료는 인증만 복구하고 거절된 명령을 재전송하지 않음', async () => {
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

test('인증 갱신 거절은 현재 세션을 종료하고 돌봄 요청을 재전송하지 않음', async () => {
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

test('캐릭터 후보 조회 중 계정이 바뀌면 결과를 폐기하고 다음 페이지를 요청하지 않음', async () => {
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
  assert.deepEqual(owners, ['a'])
})

test('쿠키가 조용히 만료되면 돌봄 쓰기 없이 조작 잠금을 해제하고 세션 변경을 알림', async () => {
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
      petConfigOptions: { queryKey: ['playground-pet', 'config'] },
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

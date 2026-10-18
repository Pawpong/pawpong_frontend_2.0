const { test, assert, axios, sessionHarness, commands } = require('./fixtures/core.fixture.cjs')

test('여섯 게임 요청은 소유자와 정확한 입력만 전송하고 점수나 보상을 보내지 않음', async () => {
  const { apiClient, api } = sessionHarness()
  const observed = []
  const abort = new AbortController()
  apiClient.defaults.adapter = async (config) => {
    observed.push(config)
    return {
      status: 200,
      data: {
        success: true,
        data: { pet: { revision: 8 }, gameOutcome: { kind: 'equip', starsDelta: 0 } },
      },
      config,
      headers: {},
    }
  }
  for (const command of commands) await api.runPetCommand(command, abort.signal)
  for (let i = 0; i < commands.length; i++) {
    assert.equal(observed[i].url, `/api/v2/playground/pet/${commands[i].kind}`)
    assert.deepEqual(JSON.parse(observed[i].data), commands[i].body)
    assert.equal(observed[i].headers.Authorization, 'Bearer fixture-owner-a')
    assert.equal(observed[i].skipAuthRefresh, true)
    assert.equal(observed[i].signal, abort.signal)
    assert.equal('score' in JSON.parse(observed[i].data), false)
    assert.equal('stars' in JSON.parse(observed[i].data), false)
  }
})

test('현재 계정의 인증 만료는 한 번 복구하되 구매와 게임 쓰기를 자동 재전송하지 않음', async () => {
  for (const command of [commands[0], commands[4], commands[5]]) {
    const { state, apiClient, api, auth, session } = sessionHarness()
    let calls = 0
    apiClient.defaults.adapter = async (config) => {
      calls++
      throw new axios.AxiosError('expired', 'ERR_BAD_REQUEST', config, null, {
        status: 401,
        data: { message: '인증이 필요합니다.' },
        config,
      })
    }
    await assert.rejects(
      auth.inPetSession(session, () => api.runPetCommand(command)),
      { status: 401 },
    )
    assert.equal(calls, 1)
    assert.equal(state.refreshes, 1)
    assert.equal(state.notifications, 1)
  }
})

test('계정 전환 뒤 도착한 게임 쓰기와 캐릭터 바이너리 응답을 폐기함', async () => {
  for (const kind of ['finish', 'character']) {
    const { state, apiClient, api, auth, session } = sessionHarness()
    let resolve, ready
    const started = new Promise((done) => (ready = done))
    let observedOwner
    apiClient.defaults.adapter = (config) => {
      observedOwner = config.headers.Authorization
      ready()
      return new Promise((done) => {
        resolve = () =>
          done({
            status: 200,
            data:
              kind === 'character'
                ? new Blob(['png'], { type: 'image/png' })
                : { success: true, data: { pet: { revision: 8 } } },
            config,
            headers: {},
          })
      })
    }
    const pending = auth.inPetSession(session, () =>
      kind === 'character' ? api.getPetCharacter() : api.runPetCommand(commands[5]),
    )
    await started
    state.token = 'fixture-owner-b'
    state.generation++
    const rejected = assert.rejects(pending, { status: 401 })
    resolve()
    await rejected
    assert.equal(observedOwner, 'Bearer fixture-owner-a')
    assert.equal(state.refreshes, 0)
  }
})

test('캐릭터 요청은 취소 가능하며 잘못된 형식과 과도한 크기를 거부함', async () => {
  const { apiClient, api } = sessionHarness()
  const abort = new AbortController()
  let payload = new Blob(['png'], { type: 'image/png' }),
    observed
  apiClient.defaults.adapter = async (config) => {
    observed = config
    return { status: 200, data: payload, config, headers: {} }
  }
  assert.equal(await api.getPetCharacter(abort.signal), payload)
  assert.equal(observed.url, '/api/v2/playground/pet/character')
  assert.equal(observed.responseType, 'blob')
  assert.equal(observed.headers.Accept, 'image/png')
  assert.equal(observed.signal, abort.signal)
  payload = new Blob(['html'], { type: 'text/html' })
  await assert.rejects(api.getPetCharacter(), { status: 503 })
  payload = new Blob([new Uint8Array(2_000_001)], { type: 'image/png' })
  await assert.rejects(api.getPetCharacter(), { status: 503 })
})

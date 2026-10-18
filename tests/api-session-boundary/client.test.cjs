const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  apiFixture,
  token,
  deferred,
  unauthorized,
  response,
} = require('./fixtures/api.fixture.cjs')

test('요청 직후 계정이 바뀌어도 새 계정 인증으로 이전 쓰기를 전송하지 않음', async () => {
  const h = apiFixture(),
    calls = []
  h.apiClient.defaults.adapter = async (config) => {
    calls.push(config)
    return response(config)
  }
  const oldToken = h.state.token
  const work = h.apiClient.post('/api/v2/example', { content: '이전 계정 내용' })
  h.state.token = token('owner-b')
  await assert.rejects(work, /계정|세션/)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].headers.Authorization, `Bearer ${oldToken}`)
})

for (const changeGeneration of [false, true]) {
  test(`계정 변경${changeGeneration ? '과 새 로그인' : '만'} 뒤 도착한 인증 실패를 재전송하지 않음`, async () => {
    const h = apiFixture(),
      calls = []
    h.apiClient.defaults.adapter = async (config) => {
      calls.push(config)
      h.state.token = token('owner-b')
      if (changeGeneration) h.state.generation++
      return unauthorized(config)
    }
    await assert.rejects(h.apiClient.post('/api/v2/example', {}), /계정|세션/)
    assert.equal(calls.length, 1)
    assert.equal(h.state.refreshes, 0)
    assert.deepEqual(h.state.redirects, [])
  })
}

test('인증 갱신 중 계정이 바뀌면 재전송이나 로그인 이동 없이 이전 요청을 끝냄', async () => {
  const h = apiFixture(),
    gate = deferred(),
    started = deferred()
  let calls = 0
  h.recovery.refreshAuthSession = async () => {
    started.resolve()
    await gate.promise
    return h.state.token
  }
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return unauthorized(config)
  }
  const work = h.apiClient.get('/api/v2/example')
  await started.promise
  h.state.token = token('owner-b')
  gate.resolve()
  await assert.rejects(work, /계정|세션/)
  assert.equal(calls, 1)
  assert.deepEqual(h.state.redirects, [])
})

test('같은 계정의 정상 인증 갱신은 기존 일반 조회 복구 계약을 유지함', async () => {
  const h = apiFixture(),
    calls = []
  h.apiClient.defaults.adapter = async (config) => {
    calls.push(config)
    return calls.length === 1 ? unauthorized(config) : response(config)
  }
  assert.equal((await h.apiClient.get('/api/v2/example')).status, 200)
  assert.equal(h.state.refreshes, 1)
  assert.equal(calls.length, 2)
  assert.equal(calls[1].headers.Authorization, `Bearer ${token('owner-a', 2)}`)
  assert.equal(JSON.stringify(calls[1]._authScope ?? {}).includes('fixture'), false)
})

test('공개 요청의 인증 실패는 다른 계정의 토큰 갱신을 시작하지 않음', async () => {
  const h = apiFixture()
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return unauthorized(config)
  }
  await assert.rejects(h.apiClient.get('/api/v2/example', { skipAuth: true }), { status: 401 })
  assert.equal(calls, 1)
  assert.equal(h.state.refreshes, 0)
})

test('현재 계정과 다른 명시적 인증을 가진 요청은 전송 전에 거부함', async () => {
  const h = apiFixture()
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return response(config)
  }
  await assert.rejects(
    h.apiClient.post(
      '/api/v2/example',
      {},
      { headers: { Authorization: `Bearer ${token('owner-b')}` } },
    ),
    /계정|세션/,
  )
  assert.equal(calls, 0)
})

test('인증 갱신 중 취소된 요청은 다시 전송하지 않음', async () => {
  const h = apiFixture(),
    gate = deferred(),
    started = deferred(),
    controller = new AbortController()
  let calls = 0
  h.recovery.refreshAuthSession = async () => {
    started.resolve()
    await gate.promise
    return h.state.token
  }
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return unauthorized(config)
  }
  const work = h.apiClient.get('/api/v2/example', { signal: controller.signal })
  await started.promise
  controller.abort()
  gate.resolve()
  await assert.rejects(work)
  assert.equal(calls, 1)
})

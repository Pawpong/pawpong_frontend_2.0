const { test } = require('node:test')
const assert = require('node:assert/strict')
const { aiSessionFixture, token, deferred } = require('./fixtures/ai-session.fixture.cjs')

test('보관함과 결과 및 원본 조회는 계정 변경 후 도착한 응답을 폐기함', async () => {
  for (const method of [
    'getMyAiImageGenerations',
    'getAiImageGenerationImage',
    'getAiImageGenerationSourceImage',
  ]) {
    const pending = deferred()
    const h = aiSessionFixture(() => pending.promise)
    const request = method === 'getMyAiImageGenerations' ? h.api[method]() : h.api[method]('job')
    h.state.token = token('account-b')
    pending.resolve({ data: [] })
    await assert.rejects(request, /계정이 변경/)
    assert.equal(h.state.refreshes, 0)
  }
})

test('사진 조회는 인증을 고정하고 취소된 요청의 결과를 반환하지 않음', async () => {
  const pending = deferred()
  let config
  const h = aiSessionFixture((_path, options) => {
    config = options
    return pending.promise
  })
  const controller = new AbortController()
  const request = h.api.getAiImageGenerationImage('job', {
    signal: controller.signal,
    timeout: 123,
  })
  assert.equal(config.headers.Authorization, `Bearer ${h.state.token}`)
  assert.equal(config.skipAuth, true)
  assert.equal(config.skipAuthRefresh, true)
  assert.equal(config.timeout, 123)
  controller.abort()
  pending.resolve({ data: new Blob(['photo']) })
  await assert.rejects(request, { name: 'AbortError' })
})

test('조회 인증 만료는 같은 계정에서만 한 번 갱신하고 다른 계정으로 재시도하지 않음', async () => {
  let calls = 0
  const h = aiSessionFixture(async () => {
    if (++calls === 1) throw new h.ApiError('만료', 401)
    return { data: [] }
  })
  await h.api.getMyAiImageGenerations()
  assert.equal(calls, 2)
  assert.equal(h.state.refreshes, 1)
  const changed = aiSessionFixture(async () => {
    changed.state.token = token('account-b')
    throw new changed.ApiError('만료', 401)
  })
  await assert.rejects(changed.api.getMyAiImageGenerations(), /계정이 변경/)
  assert.equal(changed.state.refreshes, 0)
})

test('보관함 캐시는 계정별로 나누고 인증 갱신은 유지하며 로그아웃하면 비활성화함', () => {
  const h = aiSessionFixture()
  const first = h.queries.myGenerations()
  h.state.token = token('account-a', 2)
  assert.deepEqual(h.queries.myGenerations().queryKey, first.queryKey)
  h.state.token = token('account-b')
  assert.notDeepEqual(h.queries.myGenerations().queryKey, first.queryKey)
  assert.equal(first.gcTime, 0)
  h.state.active = false
  assert.equal(h.queries.myGenerations().enabled, false)
})

test('이전 계정의 지연된 쿼리는 새 계정으로 요청하지 않음', async () => {
  let calls = 0
  const h = aiSessionFixture(async () => {
    calls++
    return { data: [] }
  })
  const query = h.queries.myGenerations()
  h.state.token = token('account-b')
  await assert.rejects(query.queryFn({ signal: new AbortController().signal }), /계정이 변경/)
  assert.equal(calls, 0)
})

test('보관함 삭제는 인증을 고정하고 실패 또는 계정 변경 시 자동 재실행하지 않음', async () => {
  const calls = []
  const h = aiSessionFixture(undefined, async (_path, config) => {
    calls.push(config)
    throw new h.ApiError('만료', 401)
  })
  const session = h.session.getAuthReadSession()
  await assert.rejects(h.api.hideAiImageGeneration('job', undefined, session))
  assert.equal(calls[0].headers.Authorization, `Bearer ${h.state.token}`)
  assert.equal(calls[0].skipAuthRefresh, true)
  assert.equal(calls[0].skipAuth, true)
  assert.equal(h.state.refreshes, 0)
  h.state.token = token('account-b')
  await assert.rejects(h.api.hideAiImageGeneration('job', undefined, session))
  assert.equal(calls.length, 1)
})

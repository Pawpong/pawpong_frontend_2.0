const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  answerApiFixture,
  token,
  deferred,
  unauthorized,
  response,
} = require('./fixtures/api.fixture.cjs')

test('첫 질문의 정상적인 빈 답변은 오류 대신 빈 상태로 반환한다', async () => {
  const h = answerApiFixture()
  h.apiClient.defaults.adapter = async (config) => response(config, null)
  assert.equal(await h.api.readCommunityAiAnswer('질문'), null)
})

test('익명 공개 답변 조회에는 인증과 자동 갱신을 적용하지 않는다', async () => {
  const h = answerApiFixture()
  h.state.token = null
  h.apiClient.defaults.adapter = async (config) => {
    assert.equal(config.headers.Authorization, undefined)
    assert.equal(config.skipAuthRefresh, true)
    return response(config, null)
  }
  assert.equal(await h.api.readCommunityAiAnswer('질문'), null)
  assert.equal(h.state.refreshes, 0)
})

test('생성 인증 만료는 같은 요청을 재전송하지 않고 명시적 재시도를 요구한다', async () => {
  const h = answerApiFixture()
  let posts = 0
  h.apiClient.defaults.adapter = async (config) => {
    posts++
    assert.deepEqual(JSON.parse(config.data), { consent: true })
    assert.equal(config.timeout, 30000)
    if (posts === 1) return unauthorized(config)
    return response(config, { status: 'pending' })
  }
  await assert.rejects(h.api.requestCommunityAiAnswer('질문'), {
    name: 'AuthWriteRetryRequiredError',
  })
  assert.equal(posts, 1)
  assert.equal(h.state.refreshes, 1)
  assert.equal((await h.api.requestCommunityAiAnswer('질문')).status, 'pending')
  assert.equal(posts, 2)
})

test('조회만 같은 계정의 인증 갱신 뒤 다시 실행한다', async () => {
  const h = answerApiFixture()
  let reads = 0
  h.apiClient.defaults.adapter = async (config) =>
    ++reads === 1 ? unauthorized(config) : response(config, null)
  assert.equal(await h.api.readCommunityAiAnswer('질문'), null)
  assert.equal(reads, 2)
  assert.equal(h.state.refreshes, 1)
})

test('계정이 바뀌면 이전 생성 응답을 버리고 인증을 다시 갱신하지 않는다', async () => {
  const h = answerApiFixture()
  const pending = deferred()
  let called
  h.apiClient.defaults.adapter = async (config) => {
    called = config
    await pending.promise
    return response(config, { status: 'completed' })
  }
  const result = h.api.requestCommunityAiAnswer('질문')
  while (!called) await Promise.resolve()
  h.state.token = token('owner-b')
  pending.resolve()
  await assert.rejects(result)
  assert.equal(h.state.refreshes, 0)
})

test('로그인 없는 생성 요청과 이미 취소된 요청은 전송하지 않는다', async () => {
  const h = answerApiFixture()
  let requests = 0
  h.apiClient.defaults.adapter = async (config) => {
    requests++
    return response(config)
  }
  h.state.token = null
  await assert.rejects(h.api.requestCommunityAiAnswer('질문'))
  h.state.token = token('owner-a')
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(h.api.requestCommunityAiAnswer('질문', controller.signal))
  assert.equal(requests, 0)
})

test('같은 계정의 정상 토큰 갱신은 진행 중인 생성 응답을 유지한다', async () => {
  const h = answerApiFixture()
  h.apiClient.defaults.adapter = async (config) => {
    h.state.token = token('owner-a', 3)
    return response(config, { status: 'completed' })
  }
  assert.equal((await h.api.requestCommunityAiAnswer('질문')).status, 'completed')
})

test('익명 조회 도중 로그인하면 익명 결과를 로그인 캐시에 저장하지 않는다', async () => {
  const h = answerApiFixture()
  h.state.token = null
  h.apiClient.defaults.adapter = async (config) => {
    h.state.token = token('owner-a')
    return response(config, null)
  }
  await assert.rejects(h.api.readCommunityAiAnswer('질문'), /로그인 정보가 변경/)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { apiFixture, token, unauthorized, response } = require('./fixtures/api.fixture.cjs')

test('현재 세션의 갱신이 거절되어 쿠키가 지워지면 원래 화면을 포함해 로그인으로 안내함', async () => {
  const h = apiFixture()
  h.recovery.refreshAuthSession = async () => {
    h.state.token = null
    throw new h.ApiError('세션이 만료되었습니다.', 401)
  }
  h.apiClient.defaults.adapter = async (config) => unauthorized(config)
  await assert.rejects(h.apiClient.get('/api/v2/example'), { status: 401 })
  assert.deepEqual(h.state.redirects, ['/login?returnUrl=%2Fai-filter'])
})

test('접근 토큰이 없는 현재 세션도 보유한 갱신 쿠키로 정상 복구할 수 있음', async () => {
  const h = apiFixture()
  h.state.token = null
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    return calls === 1 ? unauthorized(config) : response(config)
  }
  await h.apiClient.get('/api/v2/example')
  assert.equal(calls, 2)
  assert.equal(h.state.refreshes, 1)
})

test('로그아웃 시작 뒤의 정리 요청은 원래 인증으로 한 번 전송하고 갱신하지 않음', async () => {
  const h = apiFixture()
  h.state.generation++
  h.state.active = false
  let calls = 0
  h.apiClient.defaults.adapter = async (config) => {
    calls++
    assert.equal(config.headers.Authorization, `Bearer ${token('owner-a')}`)
    return response(config)
  }
  await h.apiClient.post('/api/v2/auth/logout', undefined, { skipAuthRefresh: true })
  assert.equal(calls, 1)
  assert.equal(h.state.refreshes, 0)
})

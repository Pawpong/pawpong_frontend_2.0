const { test } = require('node:test')
const assert = require('node:assert/strict')
const { token, deferred, notificationFixture } = require('./fixtures/notification.fixture.cjs')

test('계정 조회 범위는 토큰을 노출하지 않고 정상 갱신을 유지함', () => {
  const h = notificationFixture()
  const first = h.session.getAuthReadSession()
  h.state.token = token('account-a', 2)
  assert.equal(h.session.getAuthReadSession(), first)
  assert.ok(!first.scope.includes(h.state.token))
  h.state.token = token('account-b')
  assert.notEqual(h.session.getAuthReadSession().scope, first.scope)
  h.state.generation++
  assert.equal(h.session.isAuthReadSessionCurrent(first), false)
  h.state.token = null
  assert.equal(h.session.getAuthReadSession(), null)
})

test('계정 전환 뒤 도착한 이전 알림 개수는 폐기함', async () => {
  const response = deferred()
  const h = notificationFixture(() => response.promise)
  const pending = h.api.getUnreadCount()
  h.state.token = token('account-b')
  response.resolve({ data: { unreadCount: 7 } })
  await assert.rejects(pending, /계정/)
})

test('로그아웃 의도 뒤에는 쿠키가 남아 있어도 알림 조회를 시작하지 않음', async () => {
  let calls = 0
  const h = notificationFixture(async () => {
    calls++
    return { data: { unreadCount: 7 } }
  })
  h.state.active = false
  await assert.rejects(h.api.getUnreadCount(), /로그인/)
  assert.equal(calls, 0)
})

test('요청 사이의 정상 토큰 갱신은 같은 계정 알림 개수를 유지함', async () => {
  const response = deferred()
  const h = notificationFixture(() => response.promise)
  const pending = h.api.getUnreadCount()
  h.state.token = token('account-a', 2)
  response.resolve({ data: { unreadCount: 3 } })
  assert.equal(await pending, 3)
})

test('401은 현재 계정에서만 한 번 갱신하고 새 토큰으로 읽기 요청을 재개함', async () => {
  const requests = []
  const h = notificationFixture(async (path, config) => {
    requests.push({ path, config })
    if (requests.length === 1) throw new h.ApiError('합성 만료', 401)
    return { data: { unreadCount: 0 } }
  })
  assert.equal(await h.api.getUnreadCount(), 0)
  assert.equal(h.state.refreshes, 1)
  assert.equal(requests.length, 2)
  assert.equal(requests[0].config.headers.Authorization, `Bearer ${token('account-a')}`)
  assert.equal(requests[1].config.headers.Authorization, `Bearer ${token('account-a', 2)}`)
  assert.equal(requests[0].config.skipAuthRefresh, true)
})

test('이전 계정의 401은 새 계정으로 갱신하거나 재전송하지 않음', async () => {
  let calls = 0
  const h = notificationFixture(async () => {
    calls++
    h.state.token = token('account-b')
    throw new h.ApiError('합성 만료', 401)
  })
  await assert.rejects(h.api.getUnreadCount(), /계정/)
  assert.equal(h.state.refreshes, 0)
  assert.equal(calls, 1)
})

test('잘못된 알림 숫자를 캐시나 앱 배지로 전달하지 않음', async () => {
  for (const count of [-1, 1.5, NaN, Infinity, '3', null]) {
    const h = notificationFixture(async () => ({ data: { unreadCount: count } }))
    await assert.rejects(h.api.getUnreadCount(), error => error.status === 502)
    assert.equal(h.state.refreshes, 0)
  }
})

test('취소된 조회는 세션을 갱신하거나 다시 요청하지 않음', async () => {
  const controller = new AbortController()
  let calls = 0
  const h = notificationFixture(async (path, config) => {
    calls++
    assert.equal(config.signal, controller.signal)
    controller.abort()
    throw new h.ApiError('합성 취소', 401)
  })
  await assert.rejects(h.api.getUnreadCount(h.session.getAuthReadSession(), controller.signal))
  assert.equal(calls, 1)
  assert.equal(h.state.refreshes, 0)
})

test('계정별 알림 쿼리는 캐시 범위를 분리하고 조회 취소 신호를 전달함', async () => {
  const { load } = require('./fixtures/notification.fixture.cjs')
  const h = notificationFixture()
  let request
  const { notificationQueries } = load('src/entities/notification/api/notification.queries.ts', {
    '@/shared/api': { createQuery: options => options, createInfiniteQuery: options => options, STALE_TIME: { REALTIME: 0 } },
    './notification.api': { getUnreadCount: async (...args) => { request = args; return 0 } },
    '@/shared/lib/authReadSession': h.session,
  })
  const first = notificationQueries.unreadCount()
  const session = h.session.getAuthReadSession()
  h.state.token = token('account-b')
  const next = notificationQueries.unreadCount()
  assert.notDeepEqual(first.queryKey, next.queryKey)
  assert.ok(!JSON.stringify(first.queryKey).includes(token('account-a')))
  const signal = new AbortController().signal
  await first.queryFn({ signal })
  assert.deepEqual(request, [session, signal])
  h.state.token = null
  assert.equal(notificationQueries.unreadCount().enabled, false)
})

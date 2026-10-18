const { test } = require('node:test')
const assert = require('node:assert/strict')
const { status, receiptToken, setupClient } = require('./fixtures/deletion.fixture.cjs')

test('클라이언트가 인증된 탈퇴 전에 네이티브 연결을 해제하고 추가 로그아웃 없이 세션과 캐시를 정리함', async () => {
  const app = setupClient()
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.deepEqual(app.events, [
    '/api/account-deletion/prepare',
    'logout-intent',
    'notify-auth',
    'native-unregister',
    'wait-cookie-writes',
    '/api/account-deletion',
    'wait-cookie-writes',
    '/api/auth/clear-cookie',
    'clear-query-cache',
    'notify-auth',
  ])
})

test('쿠키 정리 장애에도 이미 접수된 영수증을 유지하고 캐시 정리를 수행함', async () => {
  const app = setupClient(async (url) => {
    if (url.includes('clear-cookie')) throw new Error('offline')
    return Response.json({ success: true, data: status })
  })
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.ok(app.events.includes('clear-query-cache'))
  assert.equal(app.events.includes('restore-session'), false)
})

test('탈퇴 실패를 접수 성공으로 처리하지 않고 로그아웃 가드를 해제해 재시도를 허용함', async () => {
  for (const upstream of [
    async () => Response.json({ message: receiptToken }, { status: 409 }),
    async () => {
      throw new Error(receiptToken)
    },
  ]) {
    const app = setupClient(upstream)
    await assert.rejects(
      app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
      (error) => !error.message.includes(receiptToken),
    )
    assert.ok(app.events.includes('restore-session'))
    assert.equal(app.events.includes('clear-query-cache'), false)
    assert.equal(app.events.includes('/api/auth/clear-cookie'), false)
  }
})

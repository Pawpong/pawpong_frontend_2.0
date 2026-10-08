const { test } = require('node:test')
const assert = require('node:assert/strict')
const { status, receiptToken, accepted, body, authCookie, setup, setupClient } = require('./fixtures/deletion.fixture.cjs')

test('사전 확인 재시도는 기존 영수증을 유지하고 계정 변경이나 백엔드 호출을 수행하지 않음', async () => {
  const app = setup()
  const response = await app.prepare(app.request({}, {}, '/prepare'))
  const cookie = response.headers.getSetCookie()[0]
  assert.ok(decodeURIComponent(cookie).includes(receiptToken))
  assert.equal(app.calls.length, 0)
  assert.equal((await app.prepare(app.request({}, { cookie: '' }, '/prepare'))).status, 401)
  assert.equal((await app.POST(app.request(body, { cookie: authCookie }))).status, 400)
  assert.equal(app.calls.length, 0)
})

test('사전 확인 실패는 인증과 푸시 연결을 변경하지 않음', async () => {
  const app = setupClient(undefined, async () => Response.json({ success: false }, { status: 401 }))
  await assert.rejects(app.requestAccountDeletion(() => app.events.push('clear-query-cache')))
  assert.deepEqual(app.events, ['/api/account-deletion/prepare'])
})

test('탈퇴 응답이 유실되면 재요청 없이 영수증을 복구한 뒤 세션을 정리함', async () => {
  const app = setupClient(async (url) => {
    if (url === '/api/account-deletion') throw new Error('connection reset after server accepted')
    return Response.json({ success: true, data: status })
  })
  assert.deepEqual(
    await app.requestAccountDeletion(() => app.events.push('clear-query-cache')),
    status,
  )
  assert.equal(app.events.filter((event) => event === '/api/account-deletion').length, 1)
  assert.ok(app.events.includes('/api/account-deletion/status'))
  assert.ok(app.events.includes('clear-query-cache'))
  assert.equal(app.events.includes('restore-session'), false)
})

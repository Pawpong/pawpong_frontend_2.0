const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup, status } = require('./fixtures/session.fixture.cjs')

test('네이티브 탈퇴 확인 대기 중 앱이 복귀해도 보호 요청이 끝날 때까지 인증을 유지함', async () => {
  const app = setup()
  let cacheCleared = false
  const pending = app.requestAccountDeletion(() => (cacheCleared = true))
  await app.nativeStarted
  app.resume()
  await Promise.resolve()
  assert.equal(app.hasPendingLogout(), true)
  assert.equal(app.isAuthSessionCurrent(), false)
  assert.equal(app.calls.includes('/api/auth/clear-cookie'), false)
  assert.equal(app.cookie.get('accessToken'), 'existing-session')
  app.releaseNative()
  assert.deepEqual(await pending, status)
  assert.equal(cacheCleared, true)
  assert.equal(app.cookie.has('accessToken'), false)
  assert.equal(app.hasPendingLogout(), false)
  app.cleanup()
})

test('앱 복귀 후 탈퇴에 실패하면 같은 세션으로 네이티브 푸시를 다시 연결함', async () => {
  const app = setup({ rejectDeletion: true })
  const pending = app.requestAccountDeletion(() => assert.fail('must not clear cache'))
  await app.nativeStarted
  app.resume()
  app.releaseNative()
  await assert.rejects(pending)
  assert.equal(app.cookie.get('accessToken'), 'existing-session')
  assert.equal(app.isAuthSessionCurrent(), true)
  assert.equal(app.hasPendingLogout(), false)
  assert.equal(app.calls.includes('/api/auth/clear-cookie'), false)
  app.cleanup()
})

test('탈퇴 응답 유실과 오프라인 정리 실패 후에도 보이는 인증을 지우고 재접속 시 정리를 재시도함', async () => {
  const app = setup({ loseResponse: true, offlineClear: true })
  const pending = app.requestAccountDeletion(() => {})
  await app.nativeStarted
  app.resume()
  app.releaseNative()
  assert.deepEqual(await pending, status)
  assert.equal(app.cookie.has('accessToken'), false)
  assert.equal(app.hasPendingLogout(), true)
  assert.equal(app.canResumeAuthCookieClear(), true)
  const reopened = app.reopenLifecycle()
  assert.equal(reopened.isAuthSessionCurrent(), false)
  assert.equal(reopened.canResumeAuthCookieClear(), true)
  app.cleanup()
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup, token, refreshed, deferred } = require('./fixtures/session.fixture.cjs')

test('다른 탭에서 계정을 바꾸면 이전 갱신 성공이 새 계정 쿠키를 덮어쓰지 않음', async () => {
  const response = deferred()
  const app = setup(() => response.promise)
  app.cookie.set('accessToken', token('first'))
  const pending = app.refreshAuthSession()
  app.cookie.set('accessToken', token('second'))
  response.resolve(refreshed(token('first', 2)))
  await assert.rejects(pending, { status: 401 })
  assert.equal(app.cookie.get('accessToken'), token('second'))
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
  assert.equal(app.notifications(), 1)
})

test('다른 탭에서 계정을 바꾸면 이전 갱신 실패가 새 계정 쿠키를 지우지 않음', async () => {
  const response = deferred()
  const app = setup(() => response.promise)
  app.cookie.set('accessToken', token('first'))
  const pending = app.refreshAuthSession()
  app.cookie.set('accessToken', token('second'))
  response.resolve(new Response('', { status: 401 }))
  await assert.rejects(pending, { status: 401 })
  assert.equal(app.cookie.get('accessToken'), token('second'))
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

test('이전 계정 갱신이 대기 중이어도 새 계정은 별도 갱신을 사용함', async () => {
  const responses = [deferred(), deferred()]
  let index = 0
  const app = setup(() => responses[index++].promise)
  app.cookie.set('accessToken', token('first'))
  const old = app.refreshAuthSession()
  app.cookie.set('accessToken', token('second'))
  const current = app.refreshAuthSession()
  assert.notEqual(old, current)
  responses[0].resolve(refreshed(token('first', 2)))
  await assert.rejects(old, { status: 401 })
  assert.equal(app.refreshAuthSession(), current)
  responses[1].resolve(refreshed(token('second', 2)))
  assert.equal(await current, token('second', 2))
  assert.equal(app.cookie.get('accessToken'), token('second', 2))
  assert.equal(app.calls.filter((url) => url.endsWith('set-cookie')).length, 1)
})

test('익명 복구 대기 중 새로 로그인하면 이전 복구 결과를 저장하지 않음', async () => {
  const response = deferred()
  const app = setup(() => response.promise)
  const pending = app.restoreAuthSession()
  app.cookie.set('accessToken', token('second'))
  response.resolve(refreshed(token('first')))
  assert.equal(await pending, null)
  assert.equal(app.cookie.get('accessToken'), token('second'))
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

test('같은 계정의 토큰 갱신은 기존 대기 요청을 공유하고 정상 저장함', async () => {
  const response = deferred()
  const app = setup(() => response.promise)
  app.cookie.set('accessToken', token('first'))
  const pending = app.refreshAuthSession()
  app.cookie.set('accessToken', token('first', 2))
  assert.equal(app.refreshAuthSession(), pending)
  response.resolve(refreshed(token('first', 3)))
  assert.equal(await pending, token('first', 3))
  assert.deepEqual(app.calls, ['/api/auth/refresh', '/api/auth/set-cookie'])
})

test('서버가 다른 계정이나 역할의 토큰을 반환하면 저장하지 않음', async () => {
  for (const next of [token('second'), token('first', 2, 'breeder')]) {
    const app = setup(() => refreshed(next))
    app.cookie.set('accessToken', token('first'))
    await assert.rejects(app.refreshAuthSession(), { status: 503 })
    assert.equal(app.cookie.get('accessToken'), token('first'))
    assert.deepEqual(app.calls, ['/api/auth/refresh'])
  }
})

test('갱신 중 다른 탭에서 쿠키를 제거하면 세션을 되살리지 않음', async () => {
  const response = deferred()
  const app = setup(() => response.promise)
  app.cookie.set('accessToken', token('first'))
  const pending = app.refreshAuthSession()
  app.cookie.delete('accessToken')
  response.resolve(refreshed(token('first', 2)))
  await assert.rejects(pending, { status: 401 })
  assert.equal(app.cookie.has('accessToken'), false)
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

test('본문을 읽는 동안 바뀐 계정도 쿠키 저장 직전에 확인함', async () => {
  const body = deferred()
  const app = setup(() => ({ ok: true, status: 200, json: () => body.promise }))
  app.cookie.set('accessToken', token('first'))
  const pending = app.refreshAuthSession()
  await Promise.resolve()
  app.cookie.set('accessToken', token('second'))
  body.resolve({ success: true, data: { accessToken: token('first', 2), refreshToken: 'synthetic' } })
  await assert.rejects(pending, { status: 401 })
  assert.deepEqual(app.calls, ['/api/auth/refresh'])
})

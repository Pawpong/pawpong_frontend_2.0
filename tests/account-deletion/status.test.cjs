const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, cookiePolicy, status, receiptToken, body, receiptCookie, setup, NextRequest } = require('./fixtures/deletion.fixture.cjs')

for (const state of ['pending', 'processing', 'retryable', 'review_required', 'completed']) {
  test(`${state} 상태를 로그인 없이 다시 조회할 수 있으며 비밀값과 사용자 필드를 노출하지 않음`, async () => {
    const app = setup(async () =>
      Response.json({
        success: true,
        data: {
          ...status,
          status: state,
          receiptToken,
          email: 'private@example.com',
          userId: 'private-user',
        },
      }),
    )
    const response = await app.status(
      app.request({ receiptToken: 'forged' }, { cookie: receiptCookie }, '/status'),
    )
    const data = await response.json()
    assert.equal(response.status, 200)
    assert.equal(data.data.status, state)
    assert.equal(data.data.receiptToken, undefined)
    assert.equal(data.data.email, undefined)
    assert.equal(data.data.userId, undefined)
    const [url, options] = app.calls[0]
    assert.equal(url, 'https://api.pawpong.kr/api/v2/account-deletion/status')
    assert.equal(options.headers.Authorization, undefined)
    assert.deepEqual(JSON.parse(options.body), { requestId: status.requestId, receiptToken })
  })
}

test('맞지 않거나 잘못된 상태 응답을 거부하고 탈퇴 실패 시 세션과 영수증을 유지함', async () => {
  for (const data of [{}, { ...status, requestId: '7250e6f9-5b8c-4bdf-ac0c-66d9d11b006b' }]) {
    const app = setup(async () => Response.json({ success: true, data }))
    const response = await app.status(app.request({}, { cookie: receiptCookie }, '/status'))
    assert.equal(response.status, 502)
  }
  for (const code of [401, 409, 429, 500, 503]) {
    const app = setup(async () => Response.json({ message: receiptToken }, { status: code }))
    const response = await app.POST(app.request())
    assert.equal(response.status, code === 500 ? 502 : code)
    if (code === 401)
      assert.match(response.headers.get('set-cookie'), /accessToken=; Path=\/; Max-Age=0/)
    else assert.equal(response.headers.get('set-cookie'), null)
    assert.equal((await response.text()).includes(receiptToken), false)
  }
})

test('통신 오류를 일반화하고 브라우저 조회 기록을 닫아도 서버 탈퇴를 취소하지 않음', async () => {
  const app = setup(async () => {
    throw new Error(receiptToken)
  })
  const response = await app.POST(app.request())
  assert.equal(response.status, 503)
  assert.equal((await response.text()).includes(receiptToken), false)
  const before = app.calls.length
  const closed = await app.close(app.request({}, { cookie: receiptCookie }, '/status', 'DELETE'))
  assert.equal(closed.status, 200)
  assert.match(closed.headers.get('set-cookie'), /Max-Age=0/)
  assert.equal(app.calls.length, before)
})

test('일반 로그아웃이 로컬과 전달된 운영 호스트에서 같은 쿠키 만료 정책을 사용함', async () => {
  const route = load('src/app/api/auth/clear-cookie/route.ts', {
    '@/shared/lib/server/authCookies': cookiePolicy,
  })
  for (const [host, forwarded, count] of [
    ['localhost:3000', '', 3],
    ['internal.vercel.app', 'pawpong.kr', 6],
  ]) {
    const request = new NextRequest(`https://${host}/api/auth/clear-cookie`, {
      method: 'POST',
      headers: { host, ...(forwarded ? { 'x-forwarded-host': forwarded } : {}) },
    })
    const response = await route.POST(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.getSetCookie().length, count)
  }
})

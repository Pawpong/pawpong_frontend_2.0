const { test } = require('node:test')
const assert = require('node:assert/strict')
const { status, receiptToken, body, authCookie, receiptCookie, setup } = require('./fixtures/deletion.fixture.cjs')

test('탈퇴 BFF가 명시적 확인과 현재 쿠키를 요구하고 전달받은 사용자나 토큰을 신뢰하지 않음', async () => {
  const app = setup()
  for (const value of [{}, { confirmation: 'DELETE' }, null])
    assert.equal((await app.POST(app.request(value))).status, 400)
  assert.equal(
    (await app.POST(app.request(body, { cookie: '', Authorization: 'Bearer supplied-token' })))
      .status,
    401,
  )
  assert.equal(app.calls.length, 0)
  const response = await app.POST(
    app.request({ ...body, userId: 'other-user', accessToken: 'supplied-token' }),
  )
  assert.equal(response.status, 200)
  const [url, options] = app.calls[0]
  assert.equal(url, 'https://api.pawpong.kr/api/v2/account-deletion')
  assert.deepEqual(JSON.parse(options.body), { ...body, requestId: status.requestId, receiptToken })
  assert.equal(options.headers.Authorization, 'Bearer current-user-token')
  assert.equal(options.headers.Cookie, undefined)
  assert.equal(options.credentials, 'omit')
  assert.equal(options.redirect, 'error')
  assert.equal(options.cache, 'no-store')
})

test('조회 비밀값의 쿠키 범위를 보호하고 응답에서 모든 인증 쿠키 변형을 만료함', async () => {
  const app = setup()
  const prepared = await app.prepare(app.request({}, { cookie: authCookie }, '/prepare'))
  const receipt = prepared.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith('pawpongDeletionReceipt='))
  assert.match(receipt, /HttpOnly/i)
  assert.match(receipt, /Secure/)
  assert.match(receipt, /SameSite=strict/i)
  assert.match(receipt, /Path=\/api\/account-deletion/)
  assert.deepEqual(await prepared.json(), { success: true, prepared: true })
  const response = await app.POST(app.request())
  const data = await response.json()
  assert.deepEqual(data, { success: true, data: status })
  assert.equal(JSON.stringify(data).includes(receiptToken), false)
  assert.match(response.headers.get('cache-control'), /no-store/)
  const cookies = response.headers.getSetCookie()
  assert.equal(
    cookies.some((cookie) => cookie.startsWith('pawpongDeletionReceipt=')),
    false,
  )
  for (const name of ['accessToken', 'refreshToken', 'userRole']) {
    const matching = cookies.filter((cookie) => cookie.startsWith(`${name}=`))
    assert.equal(matching.length, 2)
    assert.ok(matching.every((cookie) => cookie.includes('Max-Age=0')))
    assert.ok(matching.some((cookie) => cookie.includes('Domain=.pawpong.kr')))
  }
})

test('탈퇴 요청과 상태 조회 및 영수증 정리가 백엔드 호출과 쿠키 변경 전에 위조 요청을 거부함', async () => {
  for (const headers of [
    { origin: 'https://evil.example' },
    { origin: 'null' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    const app = setup()
    for (const method of [app.POST, app.status, app.close, app.prepare]) {
      const response = await method(app.request(body, { cookie: receiptCookie, ...headers }))
      assert.equal(response.status, 403)
      assert.equal(response.headers.get('set-cookie'), null)
    }
    assert.equal(app.calls.length, 0)
  }
})

test('새 브라우저의 상태 조회는 영수증을 요구하고 본문이나 주소의 인증값을 허용하지 않음', async () => {
  const app = setup()
  assert.equal(
    (
      await app.status(
        app.request(
          { requestId: status.requestId, receiptToken },
          { cookie: '' },
          `/status?receiptToken=${receiptToken}`,
        ),
      )
    ).status,
    404,
  )
  assert.equal(
    (await app.status(app.request({}, { cookie: 'pawpongDeletionReceipt=broken' }, '/status')))
      .status,
    404,
  )
  assert.equal(app.calls.length, 0)
})

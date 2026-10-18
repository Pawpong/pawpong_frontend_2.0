const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup, tokens } = require('./fixtures/route.fixture.cjs')

for (const action of ['set-cookie', 'clear-cookie', 'refresh']) {
  test(`${action}는 다른 출처 요청을 쿠키와 상위 서버 접근 전에 거부함`, async () => {
    const app = setup(action)
    for (const headers of [
      { origin: 'https://foreign.invalid', 'sec-fetch-site': 'cross-site' },
      { origin: 'https://other.pawpong.kr', 'sec-fetch-site': 'same-site' },
      { origin: 'https://dev.pawpong.kr', 'sec-fetch-site': 'cross-site' },
      { origin: 'null' },
      { origin: 'https://foreign.invalid', 'x-forwarded-host': 'foreign.invalid' },
    ]) {
      const result = await app.POST(app.request(tokens, headers))
      assert.equal(result.status, 403)
      assert.equal(result.headers.getSetCookie().length, 0)
      assert.match(result.headers.get('cache-control'), /no-store/)
    }
    assert.equal(app.calls.length, 0)
    assert.equal(app.cookieReads(), 0)
  })

  test(`${action}는 같은 출처의 브라우저와 Origin 없는 기존 요청을 유지함`, async () => {
    const app = setup(action)
    for (const host of ['dev.pawpong.kr', 'localhost:3000']) {
      const request = app.request(tokens, {}, host)
      assert.equal((await app.POST(request)).status, 200)
      const legacy = app.request(tokens, {}, host)
      legacy.headers.delete('origin')
      assert.equal((await app.POST(legacy)).status, 200)
    }
  })
}

test('본문을 읽기 전에 출처 위조를 거부함', async () => {
  const app = setup('set-cookie')
  const request = app.request(tokens, { origin: 'https://foreign.invalid' })
  Object.defineProperty(request, 'body', {
    get() {
      assert.fail('거부할 본문을 읽으면 안 됨')
    },
  })
  const response = await app.POST(request)
  assert.equal(response.status, 403)
})

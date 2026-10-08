const { test } = require('node:test')
const assert = require('node:assert/strict')
const { fixture, file, postId, pixel } = require('./fixtures/photo-access.fixture.cjs')

test('사진 조회는 접근 토큰과 앱 식별 헤더만 전달하고 모든 응답 캐시를 금지한다', async () => {
  const app = fixture()
  const response = await app.request(['owner', file], {
    cookie: 'accessToken=synthetic-access; refreshToken=synthetic-refresh',
    authorization: 'Bearer unrelated',
    'user-agent': 'PawpongApp/fixture',
    'x-forwarded-for': 'untrusted',
    range: 'bytes=1-2',
  })
  assert.equal(response.status, 200)
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), pixel)
  const [url, init] = app.calls[0]
  assert.equal(url, `https://dev-api.pawpong.kr/api/v2/community/review/photos/${file}`)
  assert.deepEqual(init.headers, {
    Accept: 'image/jpeg, image/png, image/webp',
    Authorization: 'Bearer synthetic-access',
    'User-Agent': 'PawpongApp/fixture',
  })
  assert.equal(init.cache, 'no-store')
  assert.equal(init.credentials, 'omit')
  assert.equal(init.redirect, 'error')
  assert.match(response.headers.get('cache-control'), /private, no-store/)
  assert.equal(response.headers.get('vary'), 'Cookie')
  assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(response.headers.get('set-cookie'), null)
})

test('공개 글은 익명 판정을 서버에 맡기되 소유자 사진은 인증 전에 요청하지 않는다', async () => {
  const app = fixture()
  assert.equal((await app.request()).status, 200)
  assert.equal(app.calls[0][1].headers.Authorization, undefined)
  assert.equal(
    app.calls[0][0],
    `https://dev-api.pawpong.kr/api/v2/community/posts/${postId}/photos/${file}`,
  )
  assert.equal((await app.request(['owner', file])).status, 401)
  assert.equal(app.calls.length, 1)
})

test('운영 호스트와 외부 출처 및 임의 경로는 서버 호출 전에 거부한다', async () => {
  const app = fixture()
  for (const host of ['pawpong.kr', 'admin.pawpong.kr', 'dev.pawpong.kr.attacker.example']) {
    assert.equal((await app.request(undefined, {}, host)).status, 404)
  }
  for (const headers of [
    { origin: 'https://attacker.example' },
    { 'sec-fetch-site': 'cross-site' },
  ]) {
    assert.equal((await app.request(undefined, headers)).status, 403)
  }
  for (const segments of [
    [],
    ['owner', '../secret'],
    ['posts', 'not-an-id', file],
    ['owner', file, 'extra'],
    ['owner', 'review-x.svg'],
  ]) {
    assert.equal((await app.request(segments)).status, 404)
  }
  assert.equal(app.calls.length, 0)
})

test('서버 오류와 리디렉션은 내부 본문과 헤더 없이 반환한다', async () => {
  for (const status of [401, 403, 404, 429, 302, 500]) {
    const app = fixture(
      () =>
        new Response('synthetic-private-detail', {
          status,
          headers: { location: 'https://internal.invalid', 'set-cookie': 'private=fixture' },
        }),
    )
    const response = await app.request()
    assert.equal(response.status, [401, 403, 404, 429].includes(status) ? status : 502)
    assert.equal(await response.text(), '')
    assert.match(response.headers.get('cache-control'), /no-store/)
    assert.equal(response.headers.get('location'), null)
    assert.equal(response.headers.get('set-cookie'), null)
  }
})

test('전송 실패와 잘못된 사진 응답도 원문을 노출하지 않는다', async () => {
  for (const upstream of [
    () => {
      throw new Error('synthetic-private-detail')
    },
    () => Response.json({ private: 'fixture' }),
    () => new Response(pixel, { headers: { 'content-type': 'image/png', 'content-length': '1' } }),
  ]) {
    const response = await fixture(upstream).request()
    assert.equal(response.status, 502)
    assert.equal(await response.text(), '')
  }
})

test('요청 취소 신호는 사진 서버에 전달되고 응답도 폐기한다', async () => {
  const controller = new AbortController()
  const app = fixture(() => {
    controller.abort()
    return new Response(pixel, { headers: { 'content-type': 'image/png' } })
  })
  assert.equal((await app.request(undefined, {}, undefined, controller.signal)).status, 502)
  assert.equal(app.calls[0][1].signal.aborted, true)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { communitySessionFixture, token, deferred, page } = require('./fixtures/community-session.fixture.cjs')

for (const [label, method] of [['좋아요한 글 조회', 'getMyLikedPosts'], ['댓글 단 글 조회', 'getMyCommentedPosts']]) {
  test(`${label}는 계정 전환 뒤 도착한 이전 결과를 폐기함`, async () => {
    const response = deferred()
    const h = communitySessionFixture(() => response.promise)
    const pending = h.api[method]()
    h.state.token = token('account-b')
    response.resolve(page())
    await assert.rejects(pending, /계정/)
  })

  test(`${label}는 로그아웃 의도 이후 조회하지 않음`, async () => {
    let calls = 0
    const h = communitySessionFixture(async () => { calls++; return page() })
    h.state.active = false
    await assert.rejects(h.api[method](), /로그인/)
    assert.equal(calls, 0)
  })

  test(`${label}는 페이지와 크기를 유지하고 인증 및 취소 신호를 고정함`, async () => {
    let received
    const h = communitySessionFixture(async (path, config) => { received = { path, config }; return page() })
    const signal = new AbortController().signal
    await h.api[method]({ page: 2, pageSize: 24 }, h.session.getAuthReadSession(), signal)
    assert.match(received.path, /page=2&pageSize=24/)
    assert.equal(received.config.headers.Authorization, `Bearer ${token('account-a')}`)
    assert.equal(received.config.signal, signal)
    assert.equal(received.config.skipAuthRefresh, true)
  })
}

test('좋아요와 댓글 활동은 계정별 캐시를 나누고 토큰 값을 저장하지 않음', () => {
  const h = communitySessionFixture(async () => page())
  for (const method of ['myLiked', 'myCommented']) {
    h.state.token = token('account-a')
    const before = h.queries[method]()
    h.state.token = token('account-b')
    const after = h.queries[method]()
    assert.notDeepEqual(before.queryKey, after.queryKey)
    assert.ok(!JSON.stringify(before.queryKey).includes(token('account-a')))
    assert.equal(h.queries[method](24, false).enabled, false)
    h.state.token = null
    assert.equal(h.queries[method]().enabled, false)
  }
})

test('같은 계정의 정상 토큰 갱신은 활동 캐시를 유지함', () => {
  const h = communitySessionFixture(async () => page())
  const before = h.queries.myLiked()
  h.state.token = token('account-a', 2)
  assert.deepEqual(h.queries.myLiked().queryKey, before.queryKey)
})

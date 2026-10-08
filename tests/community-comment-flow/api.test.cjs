const { test } = require('node:test')
const assert = require('node:assert/strict')
const { commentApiFixture, token, response, unauthorized } = require('./fixtures/api.fixture.cjs')

test('댓글 인증 만료는 자동 재전송하지 않고 본문과 답글 대상을 유지한다', async () => {
  const h = commentApiFixture()
  let writes = 0
  h.apiClient.defaults.adapter = async (config) => {
    writes++
    assert.deepEqual(JSON.parse(config.data), { body: '댓글 본문', parentCommentId: '대상' })
    assert.equal(config.timeout, 15000)
    if (writes === 1) return unauthorized(config)
    return response(config, { commentId: '새 댓글' })
  }
  await assert.rejects(
    h.api.createCommunityComment('글', { body: '댓글 본문', parentCommentId: '대상' }),
    { name: 'AuthWriteRetryRequiredError' },
  )
  assert.equal(writes, 1)
  assert.equal(h.state.refreshes, 1)
  await h.api.createCommunityComment('글', { body: '댓글 본문', parentCommentId: '대상' })
  assert.equal(writes, 2)
})

test('이전 작성자 세션으로 새 계정의 댓글을 전송하지 않는다', async () => {
  const h = commentApiFixture()
  const previous = h.session.getAuthReadSession()
  h.state.token = token('other-owner')
  let writes = 0
  h.apiClient.defaults.adapter = async (config) => {
    writes++
    return response(config)
  }
  await assert.rejects(h.api.createCommunityComment('글', { body: '이전 계정 입력' }, previous))
  assert.equal(writes, 0)
})

test('댓글 조회는 취소 신호를 전달하고 다른 계정의 늦은 응답을 버린다', async () => {
  const h = commentApiFixture()
  const controller = new AbortController()
  h.apiClient.defaults.adapter = async (config) => {
    assert.equal(config.signal, controller.signal)
    h.state.token = token('other-owner')
    return response(config, { items: [], pagination: { currentPage: 1, hasNextPage: false } })
  }
  await assert.rejects(h.read.getCommunityComments('글', {}, controller.signal))
})

test('댓글 조회 캐시는 계정별로 분리하고 같은 계정 갱신에는 유지한다', () => {
  const h = commentApiFixture()
  const first = h.queries.comments('글').queryKey
  h.state.token = token('owner-a', 2)
  assert.deepEqual(h.queries.comments('글').queryKey, first)
  h.state.token = token('other-owner')
  assert.notDeepEqual(h.queries.comments('글').queryKey, first)
})

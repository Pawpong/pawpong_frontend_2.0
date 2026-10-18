const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  commentApiFixture,
  unauthorized,
  response,
  token,
} = require('../community-comment-flow/fixtures/api.fixture.cjs')

for (const [name, method] of [
  ['수정', 'updateCommunityComment'],
  ['삭제', 'deleteCommunityComment'],
]) {
  const send = (h, session) =>
    method === 'updateCommunityComment'
      ? h.api[method]('댓글', { body: '수정한 댓글' }, session)
      : h.api[method]('댓글', session)

  test(`댓글 ${name}은 인증 갱신 후 자동 재전송하지 않고 명시적 재시도를 요구한다`, async () => {
    const h = commentApiFixture()
    let count = 0
    h.apiClient.defaults.adapter = async (config) => {
      count++
      return count === 1 ? unauthorized(config) : response(config)
    }
    await assert.rejects(send(h), { name: 'AuthWriteRetryRequiredError' })
    assert.equal(count, 1)
    assert.equal(h.state.refreshes, 1)
    await send(h)
    assert.equal(count, 2)
  })

  test(`댓글 ${name}은 계정이 바뀌면 이전 화면의 요청을 전송하지 않는다`, async () => {
    const h = commentApiFixture()
    const session = h.session.getAuthReadSession()
    h.state.token = token('other-owner')
    let count = 0
    h.apiClient.defaults.adapter = async (config) => {
      count++
      return response(config)
    }
    await assert.rejects(send(h, session))
    assert.equal(count, 0)
  })

  test(`댓글 ${name}은 시간 제한을 적용하고 다른 계정으로 바뀐 뒤의 완료를 버린다`, async () => {
    const h = commentApiFixture()
    h.apiClient.defaults.adapter = async (config) => {
      assert.equal(config.timeout, 15000)
      h.state.token = token('other-owner')
      return response(config)
    }
    await assert.rejects(send(h), /계정|로그인/)
  })
}

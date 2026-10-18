const { test } = require('node:test')
const assert = require('node:assert/strict')
const { nodes } = require('../fixtures/react-hooks.fixture.cjs')
const { mount, tick, auth, model } = require('./fixtures/composer.fixture.cjs')

test('답글 대상 오류를 안내하고 작성한 입력과 목록 재확인 동작을 유지한다', async () => {
  let checks = 0
  const h = mount(
    async () => {
      throw new model.CommentIntentError('답글 대상을 다시 확인해 주세요.')
    },
    { onCheckComments: () => checks++ },
  )
  h.change('보존할 답글')
  h.submit()
  await tick()
  const view = h.render()
  assert.equal(view.field.value, '보존할 답글')
  const feedback = nodes(view.feedback)
  assert.ok(feedback.some((x) => x.props?.children === '답글 대상을 다시 확인해 주세요.'))
  feedback.find((x) => x.type === 'button').props.onClick()
  assert.equal(checks, 1)
})

test('정상 인증 갱신 후에는 만료 안내 대신 입력 확인과 재게시를 안내한다', async () => {
  const h = mount(async () => {
    throw new auth.AuthWriteRetryRequiredError()
  })
  h.change('게시할 댓글')
  h.submit()
  await tick()
  assert.equal(h.render().field.value, '게시할 댓글')
  assert.ok(
    nodes(h.render().feedback).some(
      (x) =>
        typeof x.props?.children === 'string' &&
        x.props.children.includes('로그인 정보를 갱신했어요.'),
    ),
  )
})

test('전송 중 답글 취소 버튼을 잠그고 입력과 대상을 고정한다', () => {
  const h = mount(() => new Promise(() => {}), { replyingToNickname: '보호자' })
  h.change('답글')
  h.submit()
  const cancel = nodes(h.render().root.props.banner).find((x) => x.type === 'button')
  assert.equal(cancel.props.disabled, true)
})

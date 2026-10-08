const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mount, tick } = require('./fixtures/composer.fixture.cjs')

test('빈 댓글과 공백은 전송하지 않는다', () => {
  let calls = 0
  const app = mount(() => calls++)
  assert.equal(app.render().button.disabled, true)
  app.change('   ')
  app.submit()
  assert.equal(calls, 0)
})

test('서버 저장 완료 후에만 성공을 표시하고 연속 제출은 한 번만 전송한다', async () => {
  const bodies = []
  let resolve
  const app = mount((body) => {
    bodies.push(body)
    return new Promise((done) => {
      resolve = done
    })
  })
  app.change('  댓글 내용  ')
  let view = app.submit()
  app.submit()
  assert.deepEqual(bodies, ['댓글 내용'])
  assert.equal(view.button.disabled, true)
  assert.equal(view.field.readOnly, true)
  assert.equal(view.feedback.props.children, '댓글을 게시하고 있어요…')
  assert.equal(view.field.value, '  댓글 내용  ')
  resolve()
  await tick()
  view = app.render()
  assert.equal(view.field.value, '')
  assert.equal(view.feedback.props.role, 'status')
  assert.equal(view.feedback.props.children, '댓글을 게시했어요.')
  assert.equal(app.change('다음 댓글').feedback.props.children, '')
})

test('실패 후 입력을 유지하고 명시적 재시도가 성공해야 완료를 표시한다', async () => {
  let shouldFail = true
  const bodies = []
  const app = mount(async (body) => {
    bodies.push(body)
    if (shouldFail) throw new Error('network unavailable')
  })
  app.change('잃어버리면 안 되는 글')
  app.submit()
  await tick()
  let view = app.render()
  assert.equal(view.field.value, '잃어버리면 안 되는 글')
  assert.equal(view.button.disabled, false)
  assert.equal(view.feedback.props.role, 'alert')
  shouldFail = false
  app.submit()
  await tick()
  view = app.render()
  assert.equal(view.feedback.props.children, '댓글을 게시했어요.')
  assert.deepEqual(bodies, ['잃어버리면 안 되는 글', '잃어버리면 안 되는 글'])
})

test('한글 조합 확정은 게시하지 않고 완성된 입력을 유지한다', async () => {
  const bodies = []
  const app = mount((body) => {
    bodies.push(body)
  })
  app.change('안녕하세')
  app.render().field.onCompositionStart()
  for (const nativeEvent of [{ isComposing: true }, { isComposing: false }]) {
    let prevented = false
    app.render().field.onKeyDown({
      key: 'Enter',
      nativeEvent,
      keyCode: 13,
      preventDefault() {
        prevented = true
      },
    })
    assert.equal(prevented, true)
  }
  assert.deepEqual(bodies, [])
  app.input.value = '안녕하세요'
  app.render().field.onCompositionEnd({ currentTarget: { value: '안녕하세요' } })
  app.submit()
  await tick()
  assert.deepEqual(bodies, ['안녕하세요'])
})

test('게시 버튼은 입력 포커스를 유지하고 폼 제출로만 저장한다', async () => {
  const bodies = []
  const app = mount((body) => {
    bodies.push(body)
  })
  const view = app.change('키보드를 유지한 채 게시')
  let focusMovePrevented = false
  view.button.onMouseDown({
    preventDefault() {
      focusMovePrevented = true
    },
  })
  assert.equal(focusMovePrevented, true)
  assert.deepEqual(bodies, [], '포인터 누름만으로 댓글을 게시하지 않는다')
  assert.equal(view.button.type, 'submit')
  app.submit()
  await tick()
  assert.deepEqual(bodies, ['키보드를 유지한 채 게시'])
})

test('상위 저장 요청이 진행 중이면 새 게시를 차단한다', () => {
  const app = mount(
    () => {
      throw new Error('must not submit')
    },
    { isSubmitting: true },
  )
  app.change('아직 저장 중')
  assert.equal(app.submit().button.disabled, true)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

// 실제 컴포넌트의 이벤트/비동기 상태를 실행한다. 브라우저의 터치 → click 변환은
// 별도 iOS WKWebView 검증으로 확인하며, 여기서는 저장 전후 계약과 중복 제출을 검증한다.
function mount(onSubmit, overrides = {}) {
  const slots = []
  let cursor = 0
  const input = { value: '', focus() {} }
  const props = {
    onSubmit,
    hasSubmitError: false,
    onClearSubmitError() {},
    ...overrides,
  }
  const react = {
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [
        slots[index],
        (value) => {
          slots[index] = value
        },
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useEffect() {},
  }
  const dependencies = {
    react,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: 'a' },
    '@/shared/api': { isApiError: () => false },
    '@/shared/ui': { Button: 'button' },
    './CommentComposerShell': { CommentComposerShell: 'shell' },
  }
  const code = ts.transpileModule(
    fs.readFileSync('src/app/(main)/community/post/[postId]/_ui/CommentComposer.tsx', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  ).outputText
  const exports = {}
  new Function('exports', 'require', code)(exports, (name) => {
    assert.ok(name in dependencies, `unexpected dependency: ${name}`)
    return dependencies[name]
  })
  function render() {
    cursor = 0
    const root = exports.CommentComposer(props)
    const form = root.props.children
    const field = form.props.children[0]
    field.props.ref.current = input
    input.value = field.props.value
    return {
      root,
      form: form.props,
      field: field.props,
      button: form.props.children[1].props.children.props,
      feedback: root.props.footer,
    }
  }
  function change(value) {
    const view = render()
    input.value = value
    view.field.onChange({ target: input })
    return render()
  }
  function submit() {
    const event = {
      prevented: false,
      preventDefault() {
        this.prevented = true
      },
    }
    render().form.onSubmit(event)
    assert.equal(event.prevented, true, 'form must not navigate away')
    return render()
  }
  return { render, change, submit, input, props }
}
const tick = () => new Promise((resolve) => setImmediate(resolve))

test('empty and whitespace drafts never send', () => {
  let calls = 0
  const app = mount(() => calls++)
  assert.equal(app.render().button.disabled, true)
  app.change('   ')
  app.submit()
  assert.equal(calls, 0)
})

test('saved confirmation appears only after the server resolves; repeated submit sends once', async () => {
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

test('failure keeps the draft and supports a successful retry without a false success message', async () => {
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

test('IME confirmation does not submit and the completed Korean text is preserved', async () => {
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

test('button mouse activation preserves the focused input and still uses form submission', async () => {
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
  assert.deepEqual(bodies, [], 'pointer press alone must not save a comment')
  assert.equal(view.button.type, 'submit')
  app.submit()
  await tick()
  assert.deepEqual(bodies, ['키보드를 유지한 채 게시'])
})

test('a pending parent mutation blocks another request', () => {
  const app = mount(
    () => {
      throw new Error('must not submit')
    },
    { isSubmitting: true },
  )
  app.change('아직 저장 중')
  assert.equal(app.submit().button.disabled, true)
})

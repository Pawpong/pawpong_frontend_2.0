const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { notificationFixture } = require('../../notifications/fixtures/notification.fixture.cjs')
const auth = notificationFixture()
const model = load('src/app/(main)/community/post/[postId]/_ui/commentThread.ts')
const feedback = load('src/app/(main)/community/post/[postId]/_ui/commentSubmitFeedback.ts', {
  '@/shared/api': {
    isApiError: (value) => value instanceof auth.ApiError,
    AuthWriteRetryRequiredError: auth.AuthWriteRetryRequiredError,
  },
  './commentThread': model,
})
// 실제 컴포넌트의 이벤트/비동기 상태를 실행한다. 브라우저의 터치 → click 변환은
// 별도 iOS WKWebView 검증으로 확인하며, 여기서는 저장 전후 계약과 중복 제출을 검증한다.
function mount(onSubmit, overrides = {}) {
  const slots = []
  let cursor = 0
  const input = { value: '', focus() {} }
  const props = {
    draft: '',
    onDraftChange(value) {
      props.draft = value
    },
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
    './commentSubmitFeedback': feedback,
    '@/shared/ui': { Button: 'button', Input: 'input' },
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
    assert.ok(name in dependencies, `등록하지 않은 의존성: ${name}`)
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
    assert.equal(event.prevented, true, '댓글 폼은 페이지를 이동하지 않는다')
    return render()
  }
  return { render, change, submit, input, props }
}
const tick = () => new Promise((resolve) => setImmediate(resolve))

module.exports = { mount, tick, auth, model }

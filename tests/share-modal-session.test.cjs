const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const compiled = ts.transpileModule(fs.readFileSync('src/shared/ui/ShareModal.tsx', 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

// 실제 컴포넌트의 핸들러를 실행한다. 훅의 상태/의존성 정리만 격리하며
// Radix DOM·키보드 동작은 별도로 Orca 내장 브라우저에서 검증한다.
function setup(copyResult = () => Promise.resolve()) {
  const slots = []
  const effects = []
  const nativeRequests = []
  const copies = []
  let cursor = 0,
    dirty = false,
    nextEffects = [],
    tree,
    open = true
  const hooks = {
    useState(initial) {
      const id = cursor++
      if (!(id in slots)) slots[id] = initial
      return [
        slots[id],
        (next) => {
          const value = typeof next === 'function' ? next(slots[id]) : next
          if (!Object.is(value, slots[id])) {
            slots[id] = value
            dirty = true
          }
        },
      ]
    },
    useRef(initial) {
      const id = cursor++
      if (!(id in slots)) slots[id] = { current: initial }
      return slots[id]
    },
    useEffect(effect, deps) {
      const id = cursor++
      if (!effects[id] || deps.some((value, i) => !Object.is(value, effects[id].deps[i])))
        nextEffects.push({ id, effect, deps })
    },
    useSyncExternalStore(_subscribe, snapshot) {
      return snapshot()
    },
  }
  const jsx = (type, props) => ({ type, props })
  const module = { exports: {} }
  const dependencies = {
    react: hooks,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@radix-ui/react-dialog': {
      Content: 'Content',
      Close: 'Close',
      Title: 'Title',
      Description: 'Description',
    },
    '@/shared/lib/cn': { cn: (...classes) => classes.filter(Boolean).join(' ') },
    '@/shared/config/site': { SHARE_IMAGE: 'https://example.test/share.png' },
    '@/shared/lib/metadata': { summarizeShareText: (text) => text },
    '@/shared/lib/kakao': { getKakao: async () => ({}), shareToKakao: () => {} },
    '@/shared/lib/nativeBridge': {
      hasNativeCapability: () => true,
      subscribeNativeCapabilities: () => () => {},
      shareNatively: () => {
        const request = deferred()
        nativeRequests.push(request)
        return request.promise
      },
    },
    './Dialog': { Dialog: 'Dialog', DialogPortal: 'Portal', DialogOverlay: 'Overlay' },
    './ShareModalIcon': { ShareModalIcon: 'Icon' },
    './ShareModal.module.css': { default: {} },
  }
  new Function('module', 'exports', 'require', 'window', 'document', 'navigator', compiled)(
    module,
    module.exports,
    (name) => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
      return dependencies[name]
    },
    { location: { origin: 'https://example.test', pathname: '/community' }, isSecureContext: true },
    { title: '공유 회귀' },
    {
      clipboard: {
        writeText: (url) => {
          copies.push(url)
          return copyResult()
        },
      },
    },
  )
  function render() {
    let attempts = 0
    do {
      assert.ok(attempts++ < 10, 'render state did not settle')
      cursor = 0
      dirty = false
      nextEffects = []
      tree = module.exports.ShareModal({ open, onOpenChange: (next) => (open = next) })
    } while (dirty)
    for (const { id, effect, deps } of nextEffects) {
      effects[id]?.cleanup?.()
      effects[id] = { deps, cleanup: effect() }
    }
    return tree
  }
  const text = (node) =>
    typeof node === 'string'
      ? node
      : Array.isArray(node)
        ? node.map(text).join('')
        : text(node?.props?.children ?? '')
  function find(predicate, node) {
    if (!node || typeof node !== 'object') return undefined
    if (Array.isArray(node)) return node.map((child) => find(predicate, child)).find(Boolean)
    if (predicate(node)) return node
    return find(predicate, node.props?.children)
  }
  const button = (label) => find((node) => node.type === 'button' && text(node) === label, tree)
  const status = () => text(find((node) => node.props?.role === 'status', tree))
  render()
  return {
    copies,
    nativeRequests,
    button,
    status,
    click(label) {
      button(label).props.onClick()
      render()
    },
    close() {
      tree.props.onOpenChange(false)
      render()
    },
    setOpen(next) {
      open = next
      render()
    },
    async settle() {
      await new Promise(setImmediate)
      render()
    },
  }
}

test('closing unresolved native share releases URL copy immediately after reopening', async () => {
  const app = setup()
  app.click('다른 앱')
  assert.equal(app.nativeRequests.length, 1)
  app.close()
  app.setOpen(true)
  assert.equal(app.status(), '')
  app.click('URL 복사')
  await app.settle()
  assert.equal(app.copies.length, 1)
  assert.equal(app.status(), 'URL을 복사했습니다.')
  app.nativeRequests[0].resolve()
  await app.settle()
  assert.equal(app.status(), 'URL을 복사했습니다.')
})

test('external parent close resets pending and old finally cannot unlock a newer copy', async () => {
  const copy = deferred()
  const app = setup(() => copy.promise)
  app.click('다른 앱')
  app.setOpen(false)
  app.setOpen(true)
  assert.equal(app.status(), '')
  app.click('URL 복사')
  app.nativeRequests[0].resolve()
  await app.settle()
  assert.equal(app.button('URL 복사').props['aria-busy'], true)
  assert.equal(app.status(), 'URL을 복사하고 있어요.')
  app.click('URL 복사')
  assert.equal(app.copies.length, 1)
  copy.resolve()
  await app.settle()
  assert.equal(app.status(), 'URL을 복사했습니다.')
  assert.equal(app.button('URL 복사').props['aria-disabled'], false)
})

test('an old native error cannot replace or clear a newer native request', async () => {
  const app = setup()
  app.click('다른 앱')
  app.close()
  app.setOpen(true)
  app.click('다른 앱')
  assert.equal(app.nativeRequests.length, 2)
  app.nativeRequests[0].reject(new Error('late failure'))
  await app.settle()
  assert.equal(app.button('다른 앱').props['aria-busy'], true)
  assert.equal(app.status(), '공유 창을 여는 중이에요.')
  app.click('URL 복사')
  assert.equal(app.copies.length, 0)
  app.nativeRequests[1].resolve()
  await app.settle()
  assert.equal(app.status(), '')
  app.click('URL 복사')
  await app.settle()
  assert.equal(app.copies.length, 1)
})

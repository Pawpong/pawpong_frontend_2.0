const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('./helpers/load-typescript.cjs')

// 상세 화면 쌓기(PawpongStack/): 새 화면으로 열 주소 규칙과 뒤로 버튼·변경 전달이 앱 쪽으로만 가는지 확인한다.
// 경로 규칙은 앱(pawpong_rn tests/nativeStack.test.cjs)과 같아야 한다.
const id = '69b0aab0bb7113dab1531ebb'

const load = ({ stack = true, pathname = '/explore' } = {}) => {
  const posted = []
  const listeners = []
  const win = {
    location: { origin: 'https://pawpong.kr', pathname },
    ReactNativeWebView: { postMessage: (message) => posted.push(JSON.parse(message)) },
    addEventListener: (_type, fn) => listeners.push(fn),
    removeEventListener: () => {},
  }
  const doc = {
    documentElement: { dataset: stack ? { nativeStack: '' } : {} },
    addEventListener() {},
    removeEventListener() {},
  }
  const bridge = loadTypescript(
    'src/shared/lib/nativeBridge.ts',
    {},
    { window: win, document: doc },
  )
  const nativeStack = loadTypescript(
    'src/shared/lib/nativeStack.ts',
    { './nativeBridge': bridge },
    { window: win, document: doc },
  )
  const receive = (data) =>
    listeners.forEach((fn) => fn({ data: JSON.stringify(data), origin: '' }))
  return { nativeStack, posted, receive }
}

test('브리더 홈·분양 상세만, 지금 화면이 아닐 때 새 화면으로 연다', () => {
  const { nativeStack } = load({ pathname: `/home/${id}` })
  const url = (href) => new URL(href, 'https://pawpong.kr')
  assert.equal(nativeStack.isStackHref(url(`/adoption/${id}`)), true)
  assert.equal(nativeStack.isStackHref(url(`/home/${id}`)), false)
  assert.equal(nativeStack.isStackHref(url('/adoption/create')), false)
  assert.equal(nativeStack.isStackHref(url(`/adoption/${id}/apply`)), false)
  assert.equal(nativeStack.isStackHref(new URL(`https://evil.example/adoption/${id}`)), false)
})

test('쌓는 앱에서만 뒤로 버튼을 앱에 맡기고, 아니면 웹 뒤로', () => {
  const app = load()
  let webBack = 0
  app.nativeStack.goBackFromScreen(() => webBack++)
  assert.deepEqual(app.posted, [{ type: 'BACK' }])
  assert.equal(webBack, 0)

  const browser = load({ stack: false })
  browser.nativeStack.goBackFromScreen(() => webBack++)
  assert.deepEqual(browser.posted, [])
  assert.equal(webBack, 1)
})

test('변경은 최종 값으로 보내고, 받은 변경은 종류별로만 넘긴다', () => {
  const { nativeStack, posted, receive } = load()
  nativeStack.postStackChange({ kind: 'breeder-favorite', id, isFavorited: false })
  assert.deepEqual(posted, [
    { type: 'STACK_CHANGE', kind: 'breeder-favorite', id, isFavorited: false },
  ])

  const breeder = []
  nativeStack.subscribeStackChanges('breeder-favorite', (change) => breeder.push(change.id))
  receive({
    type: 'STACK_CHANGES',
    changes: [
      { kind: 'adoption-favorite', id: 'a', isFavorited: true, favoriteCount: 1 },
      { kind: 'breeder-favorite', id: 'b', isFavorited: true },
    ],
  })
  receive({ type: 'STACK_CHANGES', changes: 'oops' })
  assert.deepEqual(breeder, ['b'])
})

test('상세 WebView 히스토리 위치: push 는 +1, replace 는 그대로, 뒤로는 기록된 값으로', () => {
  const entries = []
  const listeners = []
  const history = {
    state: null,
    pushState(data) {
      this.state = data
      entries.push(data)
    },
    replaceState(data) {
      this.state = data
      entries[entries.length - 1] = data
    },
  }
  const win = {
    history,
    location: { origin: 'https://pawpong.kr', pathname: '/app-shell' },
    addEventListener: (type, fn) => type === 'popstate' && listeners.push(fn),
    __PAWPONG_STACK_LAYER__: 'detail',
  }
  entries.push(null)
  const doc = { documentElement: { dataset: {} } }
  const bridge = loadTypescript(
    'src/shared/lib/nativeBridge.ts',
    {},
    { window: win, document: doc },
  )
  const nativeStack = loadTypescript(
    'src/shared/lib/nativeStack.ts',
    { './nativeBridge': bridge },
    { window: win, document: doc },
  )

  assert.equal(nativeStack.isDetailLayer(), true)
  nativeStack.installHistoryIndex()
  const base = nativeStack.getHistoryIndex()
  history.replaceState({ __NA: true }, '', `/home/${id}`) // 대기 화면을 바꿔 끼움 — 처음 연 화면
  assert.equal(nativeStack.getHistoryIndex(), base)
  history.pushState({ __NA: true }, '', `/adoption/${id}`)
  assert.equal(nativeStack.getHistoryIndex(), base + 1)
  assert.equal(history.state.__NA, true) // Next 의 기록 값은 그대로 둔다
  listeners.forEach((fn) => fn({ state: entries[0] })) // 뒤로
  assert.equal(nativeStack.getHistoryIndex(), base)
})

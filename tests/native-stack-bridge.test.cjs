const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('./helpers/load-typescript.cjs')

// 상세 화면 쌓기(PawpongStack/): 새 화면으로 열 주소 규칙과 뒤로 버튼·변경 전달이 앱 쪽으로만 가는지 확인한다.
// 경로 규칙은 앱(pawpong_rn tests/nativeStack.test.cjs)과 같아야 한다.
const id = '69b0aab0bb7113dab1531ebb'

const load = ({ stack = true, pathname = '/explore', layer } = {}) => {
  const posted = []
  const listeners = []
  const win = {
    __PAWPONG_STACK_LAYER__: layer,
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

test('버튼으로 상세를 열 때도 앱 루트면 새 화면으로, 아니면 웹 이동', () => {
  let webMoves = 0
  const move = () => webMoves++

  const root = load()
  root.nativeStack.openScreen(`/adoption/${id}`, move)
  assert.deepEqual(root.posted, [{ type: 'OPEN_SCREEN', href: `/adoption/${id}` }])
  assert.equal(webMoves, 0)

  // 상세 화면이 아닌 곳·브라우저·이미 쌓인 상세 화면 안에서는 원래대로 이동한다
  root.nativeStack.openScreen('/chat', move)
  load({ stack: false }).nativeStack.openScreen(`/adoption/${id}`, move)
  const detail = load({ layer: 'detail' })
  detail.nativeStack.openScreen(`/adoption/${id}`, move)
  assert.equal(webMoves, 3)
  assert.equal(root.posted.length, 1)
  assert.deepEqual(detail.posted, [])
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

// 상세 WebView 한 개를 흉내 낸다: history 기록·sessionStorage 는 문서가 바뀌어도 남고, 모듈(문서)은 새로 뜬다
const detailWebView = () => {
  const store = new Map()
  const sessionStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  }
  const entries = [{ url: '/app-shell', state: null }]
  let cursor = 0
  let listeners = []
  const history = {
    get state() {
      return entries[cursor].state
    },
    pushState(state, _u, url) {
      entries.splice(cursor + 1)
      entries.push({ url: url ?? entries[cursor].url, state })
      cursor += 1
    },
    replaceState(state, _u, url) {
      entries[cursor] = { url: url ?? entries[cursor].url, state }
    },
    // 실제 브라우저처럼 위치만 옮긴다. 같은 문서면 popstate 를, 다른 문서면 테스트가 새 문서를 띄운다
    go(delta) {
      goes.push(delta)
      cursor += delta
    },
  }
  const goes = []
  const fire = (type, event) => listeners.forEach((l) => l.type === type && l.fn(event))
  const back = () => {
    cursor -= 1
    fire('popstate', { state: entries[cursor].state })
  }
  const popstate = () => fire('popstate', { state: entries[cursor].state })
  const location = {
    origin: 'https://pawpong.kr',
    get href() {
      return `https://pawpong.kr${entries[cursor].url}`
    },
    get pathname() {
      return entries[cursor].url.split('?')[0]
    },
    get search() {
      const query = entries[cursor].url.split('?')[1]
      return query ? `?${query}` : ''
    },
  }
  // 새 문서: 리스너와 모듈 상태는 사라지고, 기록과 sessionStorage 는 남는다
  const loadDocument = (url) => {
    if (url) history.pushState(null, '', url)
    listeners = []
    const win = {
      history,
      sessionStorage,
      location,
      addEventListener: (type, fn) => listeners.push({ type, fn }),
      __PAWPONG_STACK_LAYER__: 'detail',
    }
    const doc = { documentElement: { dataset: {} } }
    const bridge = loadTypescript(
      'src/shared/lib/nativeBridge.ts',
      {},
      { window: win, document: doc },
    )
    return loadTypescript(
      'src/shared/lib/nativeStack.ts',
      { './nativeBridge': bridge },
      { window: win, document: doc, sessionStorage },
    )
  }
  const url = () => entries[cursor].url
  return { history, back, popstate, loadDocument, goes, url }
}

// 목록에서 상세 A 를 연 상태로 시작한다 (대기 화면을 A 로 바꿔 끼움)
const openDetail = (view, href) => {
  const stack = view.loadDocument()
  stack.installHistoryIndex(() => {})
  stack.setStackBase(stack.getHistoryIndex())
  view.history.replaceState({ __NA: true }, '', href)
  return stack
}

test('상세 WebView 히스토리 위치: push 는 +1, replace 는 그대로, 뒤로는 기록된 값으로', () => {
  const view = detailWebView()
  const stack = view.loadDocument()
  let changes = 0
  stack.installHistoryIndex(() => changes++)
  stack.setStackBase(stack.getHistoryIndex())
  view.history.replaceState({ __NA: true }, '', `/home/${id}`) // 대기 화면을 바꿔 끼움 — 처음 연 화면
  assert.equal(stack.isAtStackBase(), true)
  view.history.pushState({ __NA: true }, '', `/adoption/${id}`)
  assert.equal(stack.isAtStackBase(), false)
  assert.equal(view.history.state.__NA, true) // Next 의 기록 값은 그대로 둔다
  view.back()
  assert.equal(stack.isAtStackBase(), true)
  assert.equal(changes, 3)
})

test('쿼리만 바뀌는 이동도 위치가 바뀌고 앱에 알린다', () => {
  const view = detailWebView()
  const stack = view.loadDocument()
  let changes = 0
  stack.installHistoryIndex(() => changes++)
  stack.setStackBase(stack.getHistoryIndex())
  view.history.pushState({ __NA: true }, '', `/home/${id}?tab=reviews`)
  assert.equal(changes, 1)
  assert.equal(stack.isAtStackBase(), false)
  view.back()
  assert.equal(changes, 2)
  assert.equal(stack.isAtStackBase(), true)
})

test('로그인 완료처럼 문서가 바뀌어도 처음 연 화면 기준이 남는다', () => {
  const view = detailWebView()
  const first = view.loadDocument()
  first.installHistoryIndex(() => {})
  first.setStackBase(first.getHistoryIndex())
  view.history.replaceState({ __NA: true }, '', `/home/${id}`)

  // 상세에서 로그인 페이지로 문서 이동 → 새 문서는 마지막 위치 +1 로 이어 센다
  const login = view.loadDocument('/login')
  login.installHistoryIndex(() => {})
  assert.equal(login.isAtStackBase(), false)

  // 뒤로 가서 처음 연 화면 문서가 다시 뜨면(기록에 위치가 남아 있음) 기준과 같다
  view.back()
  const again = view.loadDocument()
  again.installHistoryIndex(() => {})
  assert.equal(again.isAtStackBase(), true)

  // 닫히면 기준이 지워진다
  again.setStackBase(null)
  assert.equal(again.isAtStackBase(), false)
})

const A = `/home/${id}`
const B = `/adoption/${id}`

test('목록 → A → 로그인 → 완료: A 로 돌아오고, 뒤로는 목록(닫기)', () => {
  const view = detailWebView()
  const stack = openDetail(view, A)
  view.history.pushState(null, '', '/login')
  view.history.pushState(null, '', '/login/review')
  let fallback = 0
  stack.completeLoginNavigation('/', () => fallback++)
  assert.deepEqual(view.goes, [-2])
  assert.equal(fallback, 0)
  view.popstate()
  assert.equal(view.url(), A)
  assert.deepEqual(stack.takeLoginReturn(), { target: null })
  assert.equal(stack.isAtStackBase(), true)
})

test('목록 → A → B → 로그인 → 완료: B 로 돌아오고, 뒤로는 A', () => {
  const view = detailWebView()
  const stack = openDetail(view, A)
  view.history.pushState(null, '', B)
  view.history.pushState(null, '', '/login')
  stack.completeLoginNavigation('/', () => {})
  view.popstate()
  assert.equal(view.url(), B)
  assert.equal(stack.isAtStackBase(), false)
  view.back()
  assert.equal(view.url(), A)
  assert.equal(stack.isAtStackBase(), true)
})

test('로그인 취소(웹 뒤로)는 로그인 직전 화면으로, 그 뒤 완료 기록은 남지 않는다', () => {
  const view = detailWebView()
  const stack = openDetail(view, A)
  view.history.pushState(null, '', '/login')
  view.back()
  assert.equal(view.url(), A)
  let fallback = 0
  stack.completeLoginNavigation('/', () => fallback++)
  assert.equal(fallback, 1)
  assert.deepEqual(view.goes, [])
})

test('로그인 중 문서가 바뀌어도(앱 로그인 완료 이동) 로그인 직전 화면으로 돌아온다', () => {
  const view = detailWebView()
  openDetail(view, A)
  // 로그인 화면과 완료 화면이 각각 새 문서로 뜬다
  view.loadDocument('/login').installHistoryIndex(() => {})
  const success = view.loadDocument('/login/success?returnUrl=%2F')
  success.installHistoryIndex(() => {})
  success.completeLoginNavigation('/', () => {})
  assert.deepEqual(view.goes, [-2])
  // A 의 문서가 다시 뜬다 (저장된 페이지가 없을 때)
  const back = view.loadDocument()
  back.installHistoryIndex(() => {})
  assert.equal(view.url(), A)
  assert.deepEqual(back.takeLoginReturn(), { target: null })
  assert.equal(back.isAtStackBase(), true)
})

test('가려던 곳이 따로 있으면(보호 화면이 로그인으로 바꿔 끼움) 직전 화면으로 돌아온 뒤 그곳으로 간다', () => {
  const view = detailWebView()
  const stack = openDetail(view, B)
  view.history.pushState(null, '', `${B}/apply`)
  view.history.replaceState(null, '', `/login?returnUrl=${encodeURIComponent(`${B}/apply`)}`)
  stack.completeLoginNavigation(`${B}/apply`, () => {})
  assert.deepEqual(view.goes, [-1])
  view.popstate()
  assert.equal(view.url(), B)
  assert.deepEqual(stack.takeLoginReturn(), { target: `${B}/apply` })
  assert.equal(stack.takeLoginReturn(), null)
})

test('루트 WebView 의 로그인 완료는 지금처럼 바로 이동한다', () => {
  const view = detailWebView()
  const stack = view.loadDocument()
  stack.installHistoryIndex(() => {})
  view.history.pushState(null, '', '/login')
  let fallback = 0
  stack.completeLoginNavigation('/', () => fallback++)
  assert.equal(fallback, 1)
})

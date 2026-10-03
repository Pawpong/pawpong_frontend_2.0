const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const stores = {
  ios: 'https://apps.apple.com/kr/app/id123456789',
  android: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
}
const script = fs.readFileSync('public/scripts/deep-link-open.js', 'utf8')
function setup(userAgent = 'iPhone', touch = 0, configured = stores) {
  const listeners = {},
    timers = new Map(),
    moves = []
  let next = 0
  class Element {
    closest() {
      return this
    }
  }
  const link = new Element()
  link.dataset = {
    iosStore: configured.ios || '',
    androidStore: configured.android || '',
    webUrl: 'https://pawpong.kr/community',
  }
  link.addEventListener = (name, fn) => (listeners['link:' + name] = fn)
  const document = {
    getElementById: () => link,
    visibilityState: 'visible',
    addEventListener: (name, fn) => (listeners['document:' + name] = fn),
  }
  const window = {
    setTimeout: (fn) => {
      timers.set(++next, fn)
      return next
    },
    clearTimeout: (id) => timers.delete(id),
    addEventListener: (name, fn) => (listeners['window:' + name] = fn),
    location: { assign: (url) => moves.push(url) },
  }
  vm.runInNewContext(script, {
    window,
    document,
    navigator: { userAgent, maxTouchPoints: touch },
    Element,
  })
  return {
    moves,
    timers,
    document,
    click: (extra = {}) => listeners['link:click']({ button: 0, ...extra }),
    flush: () => {
      const pending = [...timers.values()]
      timers.clear()
      pending.forEach((fn) => fn())
    },
    hide: () => {
      document.visibilityState = 'hidden'
      listeners['document:visibilitychange']()
    },
    pagehide: () => listeners['window:pagehide'](),
    other: () => listeners['document:click']({ target: new Element() }),
  }
}

test('unopened app falls back to the configured store on iOS, Android and desktop-mode iPad', () => {
  for (const [ua, touch, expected] of [
    ['iPhone', 0, stores.ios],
    ['Android', 0, stores.android],
    ['Macintosh', 5, stores.ios],
  ]) {
    const s = setup(ua, touch)
    assert.equal(s.timers.size, 0)
    s.click()
    s.flush()
    assert.deepEqual(s.moves, [expected])
  }
})
test('app transition cancels fallback permanently; a new click can retry after returning', () => {
  const s = setup()
  s.click()
  s.hide()
  s.document.visibilityState = 'visible'
  s.flush()
  assert.deepEqual(s.moves, [])
  s.click()
  s.flush()
  assert.deepEqual(s.moves, [stores.ios])
})
test('leaving the page or choosing another link cancels the pending redirect', () => {
  for (const action of ['pagehide', 'other']) {
    const s = setup()
    s.click()
    s[action]()
    s.flush()
    assert.deepEqual(s.moves, [])
  }
})
test('repeated clicks use one timer and modified/prevented clicks do not redirect', () => {
  const s = setup()
  s.click()
  s.click()
  assert.equal(s.timers.size, 1)
  s.flush()
  assert.equal(s.moves.length, 1)
  for (const extra of [
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
  ]) {
    const s = setup()
    s.click(extra)
    s.flush()
    assert.deepEqual(s.moves, [])
  }
})
test('missing store configuration falls back to the same content on the web', () => {
  const s = setup('iPhone', 0, {})
  s.click()
  s.flush()
  assert.deepEqual(s.moves, ['https://pawpong.kr/community'])
})

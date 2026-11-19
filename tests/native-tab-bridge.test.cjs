const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('./helpers/load-typescript.cjs')

// 앱 탭 바 연결: 웹 하단바를 숨기는 기준(PawpongTabs/)과 앱 메시지 수신 필터를 확인한다.
const fakeWindow = () => {
  const listeners = []
  const posted = []
  const win = {
    location: { origin: 'https://pawpong.kr' },
    ReactNativeWebView: { postMessage: (message) => posted.push(JSON.parse(message)) },
    addEventListener: (_type, fn) => listeners.push(fn),
    removeEventListener: (_type, fn) => listeners.splice(listeners.indexOf(fn), 1),
  }
  const doc = { documentElement: { dataset: {} }, addEventListener() {}, removeEventListener() {} }
  return { win, doc, listeners, posted }
}

const loadBridge = (env) =>
  loadTypescript('src/shared/lib/nativeBridge.ts', {}, { window: env.win, document: env.doc })

test('앱이 PawpongTabs 를 알린 경우에만 앱 탭 바로 본다', () => {
  const env = fakeWindow()
  const bridge = loadBridge(env)
  assert.equal(bridge.hasNativeTabBar(), false)
  env.doc.documentElement.dataset.nativeTabs = ''
  assert.equal(bridge.hasNativeTabBar(), true)
})

test('앱 메시지는 type 이 맞고 같은 출처일 때만 받는다', () => {
  const env = fakeWindow()
  const bridge = loadBridge(env)
  const received = []
  const stop = bridge.subscribeNativeMessage('NAVIGATE_TAB', (data) => received.push(data.href))
  const send = (data, origin = '') =>
    env.listeners.forEach((fn) => fn({ data: JSON.stringify(data), origin }))
  send({ type: 'NAVIGATE_TAB', href: '/community' })
  send({ type: 'OTHER', href: '/chat' })
  send({ type: 'NAVIGATE_TAB', href: '/chat' }, 'https://evil.example')
  stop()
  send({ type: 'NAVIGATE_TAB', href: '/explore' })
  assert.deepEqual(received, ['/community'])
})

test('탭 상태는 응답 없이 그대로 앱에 보낸다', () => {
  const env = fakeWindow()
  loadBridge(env).postNativeMessage({ type: 'TAB_STATE', href: '/', visible: true, chatUnread: 2 })
  assert.deepEqual(env.posted, [{ type: 'TAB_STATE', href: '/', visible: true, chatUnread: 2 }])
})

// 웹·앱이 같은 예시 메시지(tests/fixtures/native-tab-messages.json)로 약속을 확인한다.
const fixture = require('./fixtures/native-tab-messages.json')
const React = require('react')

// 값이 아니라 모양(키와 타입)을 비교한다. 배열은 첫 원소 모양으로 본다. 선택 키(fill·scale)는 있을 때만 맞춘다.
const shapeOf = (value) => {
  if (Array.isArray(value)) return [shapeOf(value[0])]
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, shapeOf(v)]))
  return typeof value
}

const loadTabConfig = () => {
  const env = fakeWindow()
  const bridge = loadBridge(env)
  const iconData = loadTypescript('src/shared/assets/icons/navIconData.ts')
  const NavIconSvg = () => null
  const assets = { ...iconData, NavIconSvg }
  const mainNav = loadTypescript('src/shared/config/mainNav.tsx', {
    '@/shared/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
    '@/shared/ui': { ProfileAvatar: () => null },
    '@/shared/assets': assets,
    react: React,
  })
  return loadTypescript('src/widgets/bottom-nav/model/tabConfig.ts', {
    '@/shared/config': mainNav,
    '@/shared/assets': assets,
    '@/shared/lib/nativeBridge': bridge,
  })
}

test('메시지 이름은 앱과 같은 예시를 따른다', () => {
  const { NATIVE_MESSAGE } = loadBridge(fakeWindow())
  for (const [name, value] of Object.entries(NATIVE_MESSAGE)) {
    assert.equal(value, name)
    assert.equal(fixture[name].type, value)
  }
})

test('TAB_CONFIG 는 하단 탭 다섯 칸을 예시와 같은 모양으로 보낸다', () => {
  const config = loadTabConfig().buildTabConfig()
  assert.deepEqual(
    config.tabs.map((tab) => tab.href),
    ['/', '/explore', '/chat', '/community', '/home'],
  )
  const tabShape = (tab) => {
    const strip = ({ scale, ...icon }) => ({ ...icon, paths: icon.paths.map(({ d }) => ({ d })) })
    return shapeOf({ ...tab, icon: strip(tab.icon), activeIcon: strip(tab.activeIcon) })
  }
  assert.deepEqual(shapeOf({ ...config, tabs: [] }), shapeOf({ ...fixture.TAB_CONFIG, tabs: [] }))
  for (const tab of config.tabs)
    assert.deepEqual(tabShape(tab), tabShape(fixture.TAB_CONFIG.tabs[0]))
  assert.equal(config.tabs.find((tab) => tab.href === '/chat').badge, true)
  assert.equal(config.tabs.find((tab) => tab.href === '/home').avatar, true)
  // 앱은 직선 명령 경로만 받는다 — 웹 아이콘이 이 범위를 벗어나면 앱 탭 바가 통째로 빠진다
  for (const tab of config.tabs)
    for (const icon of [tab.icon, tab.activeIcon])
      for (const path of icon.paths) assert.match(path.d, /^[MLHVZmlhvz0-9 .,-]+$/)
})

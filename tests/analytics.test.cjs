const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const policy = {}
new Function(
  'exports',
  ts.transpileModule(fs.readFileSync('src/shared/lib/analyticsPolicy.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
)(policy)

test('analytics replaces identifying route segments and never sends queries, hashes or callback URLs', () => {
  assert.deepEqual(
    policy.analyticsPage('/community/post/private-id?token=secret#email@example.com'),
    {
      path: '/community/post/:post',
      screen: 'community_post',
    },
  )
  assert.deepEqual(policy.analyticsPage('/home/private-user'), {
    path: '/home/:user',
    screen: 'user_home',
  })
  assert.equal(policy.analyticsPage('/login/success?accessToken=secret'), null)
  assert.equal(policy.analyticsPage('/api/auth/callback'), null)
  assert.equal(policy.analyticsPage('/arbitrary-user-supplied-text'), null)
  assert.equal(policy.analyticsPage('/adoption/create').screen, 'adoption_create')
})

test('only production hosts or an explicitly enabled local debug session collect', () => {
  assert.equal(policy.analyticsEnabled('pawpong.kr', 'production', false), true)
  for (const host of [
    'dev.pawpong.kr',
    'preview.vercel.app',
    'pawpong.kr.attacker.test',
    'localhost',
  ]) {
    assert.equal(policy.analyticsEnabled(host, 'production', false), false)
  }
  assert.equal(policy.analyticsEnabled('pawpong.kr', 'development', false), false)
  assert.equal(policy.analyticsEnabled('localhost', 'development', true), true)
  assert.equal(policy.analyticsEnabled('preview.vercel.app', 'development', true), false)
})

test('referrers retain origin or safe route only', () => {
  assert.equal(
    policy.analyticsReferrer('https://example.com/search?q=private'),
    'https://example.com',
  )
  assert.equal(
    policy.analyticsReferrer('https://pawpong.kr/chat?roomId=secret'),
    'https://pawpong.kr/chat',
  )
  assert.equal(
    policy.analyticsReferrer('https://pawpong.kr/home/private'),
    'https://pawpong.kr/home/:user',
  )
  assert.equal(policy.analyticsReferrer('https://pawpong.kr/login/success?code=secret'), '')
  assert.equal(policy.analyticsReferrer('javascript:alert(1)'), '')
})

function componentSession({ native = false, debug = false, host = 'pawpong.kr' } = {}) {
  const queue = [],
    scripts = [],
    messages = [],
    refs = [],
    effects = [],
    timers = []
  const browser = { dataLayer: queue }
  if (native) {
    browser.__PAWPONG_APP__ = { platform: 'android', capabilities: { analytics: true } }
    browser.ReactNativeWebView = { postMessage: (data) => messages.push(JSON.parse(data)) }
  }
  const document = {
    visibilityState: 'visible',
    referrer: '',
    getElementById: () => scripts[0],
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
    addEventListener() {},
    removeEventListener() {},
  }
  browser.setTimeout = (callback) => {
    timers.push(callback)
    return timers.length
  }
  browser.clearTimeout = () => {}
  let path = '/community',
    index = 0
  const code = ts.transpileModule(fs.readFileSync('src/shared/lib/PawpongAnalytics.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const out = {}
  new Function(
    'exports',
    'require',
    'window',
    'document',
    'location',
    'navigator',
    'process',
    code,
  )(
    out,
    (name) =>
      name === 'react'
        ? {
            useRef: (initial) => refs[index++] ?? (refs[index - 1] = { current: initial }),
            useEffect: (effect) => effects.push(effect),
          }
        : name === 'next/navigation'
          ? { usePathname: () => path }
          : policy,
    browser,
    document,
    { hostname: host },
    { userAgent: native ? 'Android PawpongApp/1.0' : 'Browser' },
    { env: { NEXT_PUBLIC_APP_ENV: 'production', NEXT_PUBLIC_ANALYTICS_DEBUG: String(debug) } },
  )
  const render = (next) => {
    path = next
    index = 0
    out.PawpongAnalytics()
    effects.splice(0).forEach((fn) => fn())
    timers.splice(0).forEach((fn) => fn())
  }
  return { queue, scripts, messages, render }
}

test('SPA navigation sends one page_view per visit, including return navigation; no duplicate script', () => {
  const session = componentSession()
  for (const path of [
    '/community',
    '/community',
    '/community/post/one',
    '/community/post/two',
    '/community',
  ])
    session.render(path)
  const events = session.queue.filter((item) => item.event === 'pawpong_page_view')
  assert.equal(events.length, 4)
  assert.equal(session.scripts.length, 1)
  assert.equal(JSON.stringify(events).includes('/one'), false)
  assert.equal(JSON.stringify(events).includes('/two'), false)
})

test('new Android uses native screen views without any web GTM; development remains silent', () => {
  const native = componentSession({ native: true })
  native.render('/chat')
  native.render('/chat')
  native.render('/settings')
  assert.deepEqual(native.messages, [
    { type: 'ANALYTICS_SCREEN_VIEW', screen: 'chat' },
    { type: 'ANALYTICS_SCREEN_VIEW', screen: 'settings' },
  ])
  assert.equal(native.scripts.length, 0)
  assert.equal(native.queue.length, 0)
  const dev = componentSession({ host: 'dev.pawpong.kr' })
  dev.render('/community')
  assert.equal(dev.queue.length, 0)
})

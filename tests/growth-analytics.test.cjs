const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')
const policy = load('src/shared/lib/analyticsPolicy.ts')

function session({
  host = 'pawpong.kr',
  native = false,
  supportsEvents = false,
  broken = false,
} = {}) {
  const events = [],
    scripts = [],
    messages = []
  const window = {
    dataLayer: events,
    ...(native
      ? {
          __pawpongAnalyticsTransport: 'native',
          __PAWPONG_APP__: {
            platform: 'android',
            capabilities: { analytics: true, analyticsEvents: supportsEvents },
          },
          ReactNativeWebView: { postMessage: (value) => messages.push(JSON.parse(value)) },
        }
      : {}),
  }
  const document = {
    referrer: 'https://search.test/?email=private',
    getElementById: () => scripts[0],
    createElement: () => ({}),
    head: {
      appendChild: (node) => {
        if (broken) throw Error('blocked')
        scripts.push(node)
      },
    },
  }
  const api = load(
    'src/shared/lib/analyticsEvents.ts',
    { './analyticsPolicy': policy },
    {
      window,
      document,
      location: { hostname: host, pathname: '/community/post/private?token=secret' },
      navigator: { userAgent: 'Browser' },
      process: { env: { NEXT_PUBLIC_APP_ENV: 'production' } },
    },
  )
  return { ...api, events, scripts, messages }
}

test('action allowlist excludes form values and unknown event/context pairs; method is cleared between actions', () => {
  const s = session()
  assert.equal(s.analyticsAction('purchase', 'chat'), null)
  assert.equal(s.analyticsAction('__proto__', 'chat'), null)
  assert.equal(s.analyticsAction('sign_up', 'someone@example.com'), null)
  assert.equal(s.analyticsAction('share', 'bti', 'cancelled'), null)
  s.trackAction('share', 'bti', 'clipboard')
  s.trackAction('sign_up', 'adopter')
  const actions = s.events.filter((e) => e.event === 'pawpong_action')
  assert.equal(actions.length, 2)
  assert.equal(actions[1].method, '')
  assert.equal(s.scripts.length, 1)
  assert.equal(actions[1].page_location, 'https://pawpong.kr/community/post/:post')
  assert.equal(actions[1].page_referrer, 'https://search.test')
  assert.doesNotMatch(JSON.stringify(actions), /private|secret|email=/)
  assert.doesNotThrow(() => session({ broken: true }).trackAction('sign_up', 'breeder'))
})

test('dev stays silent and native actions never initialize web GTM, including older binaries', () => {
  const dev = session({ host: 'dev.pawpong.kr' })
  dev.trackAction('generate_lead', 'adoption_application')
  assert.deepEqual(dev.events, [])
  for (const supportsEvents of [false, true]) {
    const app = session({ native: true, supportsEvents })
    app.trackAction('generate_lead', 'adoption_application')
    assert.deepEqual(app.events, [])
    assert.deepEqual(app.scripts, [])
    assert.equal(app.messages.length, Number(supportsEvents))
    if (supportsEvents)
      assert.deepEqual(app.messages[0], {
        type: 'ANALYTICS_EVENT',
        analytics_event: 'generate_lead',
        action_context: 'adoption_application',
        method: '',
      })
  }
})

test('new product routes are measured while result identifiers and signup tokens stay local', () => {
  for (const path of [
    '/playground/walk-card',
    '/playground/taste',
    '/playground/bti',
    '/playground/memory-card',
    '/level',
    '/my-activity',
  ])
    assert.ok(policy.analyticsPage(path))
  assert.deepEqual(policy.analyticsPage('/playground/cards/bti-enfp?email=private'), {
    path: '/playground/cards/:card',
    screen: 'play_card',
  })
  assert.equal(policy.analyticsPage('/signup/general/profile?token=secret').screen, 'signup_step')
})

test('GTM artifact forwards only the event contract and preserves the existing single page-view trigger', () => {
  const data =
    require('../.kiro/specs/growth-discovery-20261021/web-container.json').containerVersion
  assert.equal(data.tag.filter((tag) => tag.type === 'googtag').length, 1)
  const tag = data.tag.find((tag) => tag.name === 'GA4 - Pawpong successful actions')
  const trigger = data.trigger.find((trigger) => trigger.triggerId === tag.firingTriggerId[0])
  const pattern = new RegExp(trigger.filter[0].parameter.find((p) => p.key === 'arg1').value)
  for (const name of [
    'sign_up',
    'generate_lead',
    'share',
    'pawpong_chat_open',
    'pawpong_post_publish',
    'pawpong_play_start',
    'pawpong_play_complete',
  ])
    assert.ok(pattern.test(name))
  for (const name of ['page_view', 'purchase', 'private_email', 'sign_up_other'])
    assert.equal(pattern.test(name), false)
  assert.equal(tag.tagFiringOption, 'ONCE_PER_EVENT')
})

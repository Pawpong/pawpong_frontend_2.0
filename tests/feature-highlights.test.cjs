const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(file, dependencies = {}) {
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  new Function('require', 'module', 'exports', source)(
    (name) => {
      if (name in dependencies) return dependencies[name]
      throw new Error(`Unexpected dependency ${name}`)
    },
    module,
    module.exports,
  )
  return module.exports
}
const policy = load('src/entities/feature-highlight/model/policy.ts')
const card = (changes = {}) => ({
  id: 'care-map',
  eyebrow: '새로 만나요',
  title: '우리 동네 돌봄 지도',
  description: '가까운 동물병원과 보호시설을 찾아보세요.',
  icon: 'map',
  enabled: true,
  placements: ['home', 'playground'],
  actions: [{ label: '동물병원 찾기', href: '/care-map' }],
  ...changes,
})
const config = (cards = [card()], revision = 0) => ({ revision, cards })
test('valid empty config stays empty rather than resurrecting a default', () => {
  const value = policy.parseFeatureHighlightConfig(config([], 4))
  for (const placement of ['home', 'explore', 'playground'])
    assert.deepEqual(policy.visibleHighlights(value, placement), [])
})
test('disabled and excluded cards remain hidden in order without mutating input', () => {
  const input = config([
    card(),
    card({ id: 'off', enabled: false }),
    card({
      id: 'spark',
      icon: 'spark',
      placements: ['explore'],
      actions: [{ label: 'AI 사진', href: '/ai-filter' }],
    }),
  ])
  const clone = structuredClone(input)
  assert.deepEqual(
    policy.visibleHighlights(input, 'home').map((x) => x.id),
    ['care-map'],
  )
  assert.deepEqual(
    policy.visibleHighlights(input, 'explore').map((x) => x.id),
    ['spark'],
  )
  assert.deepEqual(input, clone)
})
test('legacy map placements cannot bring the map back into explore through renamed cards', () => {
  for (const change of [
    {},
    { id: 'legacy', icon: 'spark' },
    { id: 'legacy', icon: 'heart', actions: [{ label: '시설', href: '/care-map?kind=shelter' }] },
  ]) {
    const value = config([card({ ...change, placements: ['home', 'explore', 'playground'] })])
    assert.equal(policy.visibleHighlights(value, 'explore').length, 0)
    assert.equal(policy.visibleHighlights(value, 'playground').length, 1)
  }
})
test('external, encoded, payment and unreleased URLs fail before rendering', () => {
  for (const href of [
    'https://pawpong.kr/care-map',
    '//evil.test',
    'javascript:alert(1)',
    '/%63are-map',
    '/ai-filter#buy',
    '/care-map?kind=hospital&url=evil',
    '/playground?buy=1',
    '/playground/pet',
    '/billing',
    '/ai-filter/',
  ]) {
    assert.throws(() =>
      policy.parseFeatureHighlightConfig(config([card({ actions: [{ label: 'go', href }] })])),
    )
  }
  for (const href of policy.HIGHLIGHT_DESTINATIONS)
    assert.doesNotThrow(() =>
      policy.parseFeatureHighlightConfig(config([card({ actions: [{ label: 'go', href }] })])),
    )
})
test('invalid payloads fail distinctly from empty settings', () => {
  for (const value of [
    null,
    {},
    { cards: [] },
    config([], -1),
    config([], 0.5),
    config([], Number.MAX_SAFE_INTEGER),
    config(Array.from({ length: 13 }, (_, i) => card({ id: `card-${i}` }))),
    config([card(), card()]),
  ])
    assert.throws(() => policy.parseFeatureHighlightConfig(value))
  for (const changes of [
    { enabled: 'false' },
    { title: ' ' },
    { title: '가'.repeat(51) },
    { description: '가'.repeat(141) },
    { eyebrow: '가'.repeat(21) },
    { placements: [] },
    { placements: ['home', 'home'] },
    { placements: ['shop'] },
    { icon: 'pet' },
    { id: '../foo' },
    { actions: [] },
    { actions: [{ label: '', href: '/ai-filter' }] },
  ])
    assert.throws(() => policy.parseFeatureHighlightConfig(config([card(changes)])))
})
test('response extras are removed while labels remain plain text data', () => {
  const value = policy.parseFeatureHighlightConfig({
    ...config([
      card({
        title: '<img src=x onerror=alert(1)>',
        html: '<script/>',
        actions: [{ label: '<b>병원</b>', href: '/care-map', target: '_blank' }],
      }),
    ]),
    injected: true,
  })
  assert.equal(value.cards[0].title, '<img src=x onerror=alert(1)>')
  assert.equal('html' in value.cards[0], false)
  assert.equal('target' in value.cards[0].actions[0], false)
  assert.equal('injected' in value, false)
})
test('public API uses placement and abort signal without credentials or refresh, preserving empty and failed responses', async () => {
  const calls = []
  let response = config([], 9)
  const { getFeatureHighlights } = load(
    'src/entities/feature-highlight/api/feature-highlight.api.ts',
    {
      '@/shared/api': {
        API_VERSION: '/api/v2',
        unwrap: (r) => r.data.data,
        apiClient: {
          get: async (...args) => {
            calls.push(args)
            return { data: { data: response } }
          },
        },
      },
      '../model/policy': policy,
    },
  )
  const signal = new AbortController().signal
  assert.deepEqual(await getFeatureHighlights('playground', signal), config([], 9))
  assert.equal(calls[0][0], '/api/v2/home/feature-highlights')
  assert.equal(calls[0][1].params.placement, 'playground')
  assert.equal(calls[0][1].signal, signal)
  assert.equal(calls[0][1].skipAuth, true)
  assert.equal(calls[0][1].skipAuthRefresh, true)
  assert.equal(calls[0][1].withCredentials, false)
  response = undefined
  await assert.rejects(getFeatureHighlights('home'))
})

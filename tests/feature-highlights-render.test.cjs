const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const query = require('@tanstack/react-query')
function load(file, dependencies) {
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('require', 'module', 'exports', source)(
    (name) => (name in dependencies ? dependencies[name] : require(name)),
    module,
    module.exports,
  )
  return module.exports
}
const policy = load('src/entities/feature-highlight/model/policy.ts', {})
const { FeatureHighlights } = load('src/widgets/feature-highlights/ui/FeatureHighlights.tsx', {
  'next/link': {
    __esModule: true,
    default: ({ children, ...props }) => React.createElement('a', props, children),
  },
  '@/entities/feature-highlight': {
    ...policy,
    getFeatureHighlights: async () => {
      throw new Error('unexpected request')
    },
  },
  '@/shared/ui': { Container: ({ children }) => React.createElement('section', {}, children) },
  '@/shared/assets': { PixelArrowRightIcon: () => null },
  '@/shared/lib/fonts': { cafe24Proup: { className: 'pixel-font' } },
  './FeatureHighlights.module.css': { __esModule: true, default: {} },
})
function render(client, placement) {
  return renderToStaticMarkup(
    React.createElement(
      query.QueryClientProvider,
      { client },
      React.createElement(
        query.IsRestoringProvider,
        { value: true },
        React.createElement(
          'main',
          {},
          React.createElement('p', {}, '기존 페이지 본문'),
          React.createElement(FeatureHighlights, { placement, renderMap: () => null }),
        ),
      ),
    ),
  )
}
test('malformed optional response stays hidden under globally throwing QueryClient', () => {
  const client = new query.QueryClient({
    defaultOptions: { queries: { throwOnError: () => true } },
  })
  let error
  try {
    policy.parseFeatureHighlightConfig({ revision: 0, cards: [{ id: 'malformed' }] })
  } catch (cause) {
    error = cause
  }
  assert.ok(error instanceof Error)
  try {
    for (const placement of ['home', 'explore', 'playground']) {
      const cached = client.getQueryCache().build(client, {
        queryKey: ['feature-highlights', placement],
      })
      cached.setState({
        status: 'error',
        error,
        fetchStatus: 'idle',
        errorUpdateCount: 1,
        errorUpdatedAt: Date.now(),
      })
      assert.equal(render(client, placement), '<main><p>기존 페이지 본문</p></main>')
    }
  } finally {
    client.clear()
  }
})

test('valid optional cards still render under the same globally throwing QueryClient', () => {
  const client = new query.QueryClient({
    defaultOptions: { queries: { throwOnError: () => true } },
  })
  const config = policy.parseFeatureHighlightConfig({
    revision: 1,
    cards: [
      {
        id: 'ai-photo',
        title: 'AI 사진 만들기',
        description: '우리 아이 사진으로 시작해요.',
        eyebrow: '새로 만나요',
        icon: 'spark',
        enabled: true,
        placements: ['home'],
        actions: [{ label: '사진 만들기', href: '/ai-filter' }],
      },
    ],
  })
  client.setQueryData(['feature-highlights', 'home'], config)
  try {
    const markup = render(client, 'home')
    assert.match(markup, /기존 페이지 본문/)
    assert.match(markup, /AI 사진 만들기/)
    assert.match(markup, /href="\/ai-filter"/)
  } finally {
    client.clear()
  }
})

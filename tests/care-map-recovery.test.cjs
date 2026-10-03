const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { QueryClient, QueryObserver } = require('@tanstack/react-query')

const searchState = {}
new Function(
  'exports',
  ts.transpileModule(fs.readFileSync('src/features/care-map/lib/care-search-state.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText,
)(searchState)

const compiled = ts.transpileModule(
  fs.readFileSync('src/features/care-map/ui/CareMapContent.tsx', 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  },
).outputText

function renderer(getResult) {
  const exports = {}
  // Render the actual result/error branches with real React hooks and React Query state.
  // The SDK and decorative children are outside this network recovery regression.
  const dependencies = {
    'next/dynamic': () => () => null,
    '@tanstack/react-query': {
      useQuery: ({ queryKey }) => (queryKey[0] === 'care-places' ? getResult() : {}),
    },
    '@/entities/care-place': {},
    '@/shared/lib/fonts': { cafe24Proup: { className: 'test-font' } },
    '../lib/care-location': {},
    '../lib/care-search-state': searchState,
    '@/shared/ui/FeatureIntro': {
      FeatureIntro: ({ children }) => React.createElement('header', null, children),
    },
    './CareMapIcon': { CareMapIcon: () => null },
    './CarePlaceDetails': { CarePlaceDetails: () => null },
    './CareMapGuide': { CareMapGuide: () => null },
    './care-map.css': {},
  }
  new Function('exports', 'require', compiled)(exports, (id) => dependencies[id] ?? require(id))
  return () =>
    renderToStaticMarkup(React.createElement(exports.CareMapContent, { initialKind: 'shelter' }))
}

const page = {
  places: [
    {
      id: 'registered-shelter',
      kind: 'shelter',
      name: '등록 보호센터',
      address: '서울 중구',
      roadAddress: '',
      phone: '02-123-4567',
      latitude: null,
      longitude: null,
      distanceMeters: null,
      directionsUrl: null,
      placeUrl: 'https://map.kakao.com/link/search/shelter',
      referral: null,
      locationStatus: 'unavailable',
    },
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1,
  hasMore: false,
  limited: false,
  locationUnavailable: true,
}

test('a failed location retry retains loaded facilities and offers retry, then recovers', async () => {
  let fail = false
  const client = new QueryClient()
  const observer = new QueryObserver(client, {
    queryKey: ['care-places', 'recovery'],
    queryFn: async () => {
      if (fail) throw new Error('service unavailable')
      return page
    },
    retry: false,
    gcTime: 0,
  })
  let result = observer.getCurrentResult()
  const unsubscribe = observer.subscribe((next) => {
    result = next
  })
  const render = renderer(() => result)
  try {
    await observer.refetch()
    assert.match(render(), /data-place-id="registered-shelter"/)
    fail = true
    await observer.refetch()
    assert.equal(result.isRefetchError, true)
    const failed = render()
    assert.match(failed, /data-place-id="registered-shelter"/)
    assert.match(failed, /이전 조회 결과를 표시하고 있어요/)
    assert.match(failed, /다시 확인/)
    assert.doesNotMatch(failed, /시설 정보를 불러오지 못했어요\.<\/p>/)
    fail = false
    await observer.refetch()
    assert.match(render(), /data-place-id="registered-shelter"/)
    assert.doesNotMatch(render(), /이전 조회 결과를 표시하고 있어요/)
  } finally {
    unsubscribe()
    client.clear()
  }
})

test('an initial failure with no loaded records shows a recoverable error', async () => {
  const client = new QueryClient()
  const observer = new QueryObserver(client, {
    queryKey: ['care-places', 'initial-failure'],
    queryFn: async () => {
      throw new Error('offline')
    },
    retry: false,
    gcTime: 0,
  })
  let result = observer.getCurrentResult()
  const unsubscribe = observer.subscribe((next) => {
    result = next
  })
  try {
    await observer.refetch()
    const html = renderer(() => result)()
    assert.match(html, /시설 정보를 불러오지 못했어요/)
    assert.match(html, /다시 시도/)
    assert.doesNotMatch(html, /이전 조회 결과를 표시하고 있어요/)
  } finally {
    unsubscribe()
    client.clear()
  }
})

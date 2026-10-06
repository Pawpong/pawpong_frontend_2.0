const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', source)(output, (id) => dependencies[id] ?? require(id))
  return output
}
const { createCareSearchState, careSearchReducer } = load(
  'src/features/care-map/lib/care-search-state.ts',
)
const center = { latitude: 37.459, longitude: 126.953 }
const otherCenter = { latitude: 35.18, longitude: 129.08 }
const apply = (...actions) => actions.reduce(careSearchReducer, createCareSearchState('hospital'))

test('nearby and referral compose in either order without losing a submitted query', () => {
  const query = { type: 'query', query: ' 서울대학교 ' }
  const nearby = { type: 'nearby', center, origin: 'location' }
  const referral = { type: 'referral', enabled: true }
  const first = apply(query, nearby, referral)
  const second = apply(query, referral, nearby)
  assert.deepEqual(first, second)
  assert.equal(first.search.query, '서울대학교')
  assert.equal(first.search.scope, 'nearby')
  assert.equal(first.search.referralOnly, true)
  assert.equal(first.nearbyOrigin, 'location')
  assert.equal(first.search.latitude, center.latitude)
})

test('typing a search, clearing it, and changing radius never move the search anchor', () => {
  let state = apply(
    { type: 'nearby', center, origin: 'location' },
    { type: 'referral', enabled: true },
  )
  for (const action of [
    { type: 'query', query: '해마루' },
    { type: 'radius', radius: 20000 },
    { type: 'query', query: '' },
  ]) {
    state = careSearchReducer(state, action)
    assert.equal(state.search.scope, 'nearby')
    assert.equal(state.search.latitude, center.latitude)
    assert.equal(state.search.longitude, center.longitude)
    assert.equal(state.search.referralOnly, true)
    assert.equal(state.nearbyOrigin, 'location')
  }
  assert.equal(state.search.query, '')
  assert.equal(state.search.radius, 20000)
})

test('map search and location search identify their own explicit centers while retaining filters', () => {
  let state = apply({ type: 'referral', enabled: true }, { type: 'query', query: '본' })
  state = careSearchReducer(state, { type: 'nearby', center, origin: 'location' })
  state = careSearchReducer(state, { type: 'nearby', center: otherCenter, origin: 'map' })
  assert.equal(state.nearbyOrigin, 'map')
  assert.equal(state.search.longitude, otherCenter.longitude)
  assert.equal(state.search.referralOnly, true)
  assert.equal(state.search.query, '본')
  state = careSearchReducer(state, { type: 'nearby', center, origin: 'location' })
  assert.equal(state.nearbyOrigin, 'location')
  assert.equal(state.search.longitude, center.longitude)
  assert.equal(state.search.query, '본')
})

test('regional directory and referral filters compose, including a return from nearby', () => {
  let state = apply(
    { type: 'region', region: 'seoul' },
    { type: 'referral', enabled: true },
    { type: 'query', query: '서울' },
  )
  assert.equal(state.search.region, 'seoul')
  assert.equal(state.search.scope, 'directory')
  state = careSearchReducer(state, { type: 'nearby', center, origin: 'location' })
  state = careSearchReducer(state, { type: 'directory' })
  assert.equal(state.search.region, 'seoul')
  assert.equal(state.search.scope, 'directory')
  assert.equal(state.search.referralOnly, true)
  assert.equal(state.search.query, '서울')
})

test('facility type retains area/query/radius, and shelters never receive a hospital-only condition', () => {
  let state = apply(
    { type: 'nearby', center, origin: 'map' },
    { type: 'query', query: '서울' },
    { type: 'radius', radius: 10000 },
    { type: 'referral', enabled: true },
  )
  for (const kind of ['shelter', 'hospital']) {
    state = careSearchReducer(state, { type: 'kind', kind })
    assert.equal(state.search.kind, kind)
    assert.equal(state.search.query, '서울')
    assert.equal(state.search.radius, 10000)
    assert.equal(state.search.latitude, center.latitude)
    assert.equal(state.search.scope, 'nearby')
    assert.equal(state.search.referralOnly, false)
  }
})

test('pet cafes have no nationwide directory, so they start and switch into a map-centred nearby search', () => {
  const initial = createCareSearchState('cafe')
  assert.equal(initial.search.scope, 'nearby')
  assert.equal(initial.search.radius, 5000)
  assert.equal(initial.nearbyOrigin, 'map')

  const fromDirectory = apply(
    { type: 'region', region: 'seoul' },
    { type: 'referral', enabled: true },
    { type: 'query', query: '성수' },
    { type: 'kind', kind: 'cafe' },
  )
  assert.equal(fromDirectory.search.kind, 'cafe')
  assert.equal(fromDirectory.search.scope, 'nearby')
  assert.equal(fromDirectory.nearbyOrigin, 'map')
  assert.equal(fromDirectory.search.referralOnly, false)
  assert.equal(fromDirectory.search.query, '성수')

  const fromNearby = apply(
    { type: 'nearby', center, origin: 'location' },
    { type: 'kind', kind: 'cafe' },
  )
  assert.equal(fromNearby.search.scope, 'nearby')
  assert.equal(fromNearby.nearbyOrigin, 'location')
  assert.equal(fromNearby.search.latitude, center.latitude)

  assert.deepEqual(careSearchReducer(fromDirectory, { type: 'reset' }), initial)
})

test('changing a condition clears pagination and selected facility; paging retains all conditions', () => {
  const initial = apply(
    { type: 'nearby', center, origin: 'location' },
    { type: 'query', query: '서울' },
  )
  const paged = careSearchReducer(initial, { type: 'page', page: 3 })
  const selected = careSearchReducer(paged, { type: 'select', id: 'old-place' })
  assert.deepEqual(paged.search, initial.search)
  for (const action of [
    { type: 'referral', enabled: true },
    { type: 'radius', radius: 20000 },
    { type: 'query', query: '' },
    { type: 'region', region: 'busan' },
    { type: 'nearby', center: otherCenter, origin: 'map' },
    { type: 'kind', kind: 'shelter' },
  ]) {
    const next = careSearchReducer(selected, action)
    assert.equal(next.page, 1)
    assert.equal(next.selectedId, null)
  }
  const reset = careSearchReducer(selected, { type: 'reset' })
  assert.deepEqual(reset, createCareSearchState('hospital'))
})

test('composed conditions reach the real API adapter with the correct endpoint and parameters', async () => {
  const requests = []
  const { searchCarePlaces } = load('src/entities/care-place/api/care-place.api.ts', {
    '@/shared/api': {
      apiClient: {
        get: async (url, config) => {
          requests.push({ url, config })
          return {}
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (response) => response,
    },
  })
  const state = apply(
    { type: 'region', region: 'seoul' },
    { type: 'referral', enabled: true },
    { type: 'query', query: '서울대학교' },
    { type: 'nearby', center, origin: 'location' },
    { type: 'radius', radius: 10000 },
  )
  await searchCarePlaces(state.search, state.page)
  assert.equal(requests[0].url, '/api/v2/care-map/places')
  assert.deepEqual(requests[0].config.params, {
    ...center,
    kind: 'hospital',
    query: '서울대학교',
    radius: 10000,
    scope: 'nearby',
    referralOnly: true,
    page: 1,
  })
  const regional = careSearchReducer(state, { type: 'directory' })
  await searchCarePlaces(regional.search, regional.page)
  assert.equal(requests[1].url, '/api/v2/care-map/directory')
  assert.deepEqual(requests[1].config.params, {
    kind: 'hospital',
    query: '서울대학교',
    referralOnly: true,
    region: 'seoul',
    page: 1,
  })
})

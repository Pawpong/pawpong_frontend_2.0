const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const code = ts.transpileModule(
  fs.readFileSync('src/features/care-map/lib/care-directions.ts', 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  },
).outputText
const api = {}
new Function('exports', code)(api)
const place = { name: '포퐁 & 돌봄/동물병원 #1, 분원', latitude: 37.5665, longitude: 126.978 }
test('three provider routes carry coordinates and safely encode Korean names and delimiters', () => {
  const [kakao, naver, google] = api.getCareDirections(place)
  assert.deepEqual([kakao.label, naver.label, google.label], ['카카오맵', '네이버맵', '구글맵'])
  const destination = new URL(kakao.webUrl).pathname.split('/to/')[1].split(',')
  assert.equal(decodeURIComponent(destination[0]), place.name)
  assert.deepEqual(destination.slice(1).map(Number), [place.latitude, place.longitude])
  const naverWeb = new URL(naver.webUrl)
  assert.equal(naverWeb.searchParams.get('etext'), place.name)
  assert.equal(Number(naverWeb.searchParams.get('elat')), place.latitude)
  assert.equal(Number(naverWeb.searchParams.get('elng')), place.longitude)
  assert.equal(naverWeb.searchParams.get('menu'), 'route')
  const naverApp = new URL(naver.appIntent.split('#')[0].replace('intent:', 'nmap:'))
  assert.equal(naverApp.searchParams.get('dname'), place.name)
  assert.equal(Number(naverApp.searchParams.get('dlat')), place.latitude)
  assert.equal(Number(naverApp.searchParams.get('dlng')), place.longitude)
  assert.equal(naverApp.searchParams.get('appname'), 'kr.pawpong.app')
  const fallback = naver.appIntent.match(/S.browser_fallback_url=([^;]+);/)[1]
  assert.equal(decodeURIComponent(fallback), naver.webUrl)
  const googleWeb = new URL(google.webUrl)
  assert.equal(googleWeb.searchParams.get('api'), '1')
  assert.equal(googleWeb.searchParams.get('destination'), '37.5665,126.978')
  assert.equal(googleWeb.searchParams.has('destination_place_id'), false)
})
test('native navigation reuses the app intent fallback; browsers always get working HTTPS routes', () => {
  for (const link of api.getCareDirections(place)) {
    assert.equal(api.careDirectionsHref(link, false), link.webUrl)
    assert.match(api.careDirectionsHref(link, false), /^https:/)
    assert.equal(api.careDirectionsHref(link, true), link.appIntent || link.webUrl)
  }
})
test('unresolved or invalid coordinates never create a misleading directions link', () => {
  for (const coords of [
    { latitude: null },
    { longitude: null },
    { latitude: NaN },
    { longitude: Infinity },
    { latitude: 0 },
    { longitude: 0 },
  ]) {
    assert.deepEqual(api.getCareDirections({ ...place, ...coords }), [])
  }
})

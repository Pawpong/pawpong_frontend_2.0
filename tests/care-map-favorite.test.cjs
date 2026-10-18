const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const lib = {}
new Function(
  'exports',
  ts.transpileModule(fs.readFileSync('src/features/care-map/lib/care-place-favorite.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText,
)(lib)

const place = {
  id: 'hospital-1',
  kind: 'hospital',
  name: '우리동물병원',
  category: '동물병원',
  address: '서울 중구',
  roadAddress: '서울 중구 세종대로 1',
  phone: '02-123-4567',
  latitude: 37.5666,
  longitude: 126.9781,
  distanceMeters: 120,
  placeUrl: 'https://place.map.kakao.com/1',
  directionsUrl: 'https://map.kakao.com/link/to/1',
  referral: { url: 'https://example.invalid', checkedAt: '2026-10-01', label: '2차·의뢰 진료' },
  registration: { source: '국가동물보호정보시스템', url: '', checkedAt: '', jurisdictions: [] },
}

test('즐겨찾기 저장 요청은 서버 DTO 가 받는 시설 정보만 보낸다', () => {
  // 백엔드 테스트 앱은 정의하지 않은 속성을 400 으로 막는다(forbidNonWhitelisted). 거리·의뢰·등록 정보는 보내지 않는다.
  assert.deepEqual(Object.keys(lib.toCarePlaceFavoriteSnapshot(place)).sort(), [
    'address',
    'category',
    'id',
    'kind',
    'latitude',
    'longitude',
    'name',
    'phone',
    'placeUrl',
    'roadAddress',
  ])
})

test('즐겨찾기는 저장하지 않은 거리·길찾기 링크·의뢰 정보를 비운 시설로 다시 그린다', () => {
  const favorite = {
    ...lib.toCarePlaceFavoriteSnapshot(place),
    favoritedAt: '2026-10-11T00:00:00.000Z',
  }
  assert.deepEqual(lib.favoriteToCarePlace(favorite), {
    ...favorite,
    distanceMeters: null,
    directionsUrl: null,
    referral: null,
  })
})

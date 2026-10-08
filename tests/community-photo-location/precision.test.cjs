const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

const place = load('src/features/community/lib/communityPhotoPlace.ts')
const { reindexCommunityRoutePhotos } = load('src/features/community/lib/communityRoutePhotos.ts', {
  './communityPhotoPlace': place,
})
const exact = { latitude: 37.5123, longitude: 127.0456 }
const photo = (photoIndex, extra = {}) => ({
  photoIndex,
  previewUrl: `blob:${photoIndex}`,
  ...extra,
})

test('동네 정도는 소수점 둘째 자리로 흐리고 사진 위치 그대로는 원래 후보를 씀', () => {
  assert.deepEqual(place.blurCommunityLocation(exact), { latitude: 37.51, longitude: 127.05 })
  const area = place.communityPhotoPlace(photo(1, { location: exact }), 'area')
  assert.deepEqual(area, {
    name: '사진 2의 장소',
    latitude: 37.51,
    longitude: 127.05,
    photoIndex: 1,
  })
  const precise = place.communityPhotoPlace(photo(0, { location: exact }), 'exact')
  assert.deepEqual(precise, { name: '사진 1의 장소', ...exact, photoIndex: 0 })
  assert.equal(place.communityPhotoPlace(photo(0), 'exact'), undefined)
})

test('공유할 장소에는 촬영 시각이나 미리보기 주소가 섞이지 않음', () => {
  const point = place.communityPhotoPlace(
    photo(0, { location: exact, takenAt: Date.UTC(2025, 4, 1) }),
    'area',
  )
  assert.deepEqual(Object.keys(point).sort(), ['latitude', 'longitude', 'name', 'photoIndex'])
})

test('담긴 좌표가 사진 위치 그대로인지 흐린 것인지 직접 옮긴 것인지 구분함', () => {
  const photos = [photo(0, { location: exact })]
  const base = { name: '사진 1의 장소', photoIndex: 0 }
  assert.equal(place.photoPlacePrecisionOf({ ...base, ...exact }, photos), 'exact')
  assert.equal(
    place.photoPlacePrecisionOf({ ...base, latitude: 37.51, longitude: 127.05 }, photos),
    'area',
  )
  assert.equal(
    place.photoPlacePrecisionOf({ ...base, latitude: 37.6, longitude: 127.1 }, photos),
    undefined,
  )
  assert.equal(place.photoPlacePrecisionOf({ name: '공원', ...exact }, photos), undefined)
})

test('정밀도를 바꾸면 사진에서 담은 좌표만 옮기고 직접 고른 장소는 그대로 둠', () => {
  const photos = [
    photo(0, { location: exact }),
    photo(1, { location: { latitude: 35.1, longitude: 129.04 } }),
  ]
  const route = [
    { name: '사진 1의 장소', latitude: 37.51, longitude: 127.05, photoIndex: 0 },
    { name: '바닷가', latitude: 35.2, longitude: 129.2, photoIndex: 1 },
    { name: '검색한 카페', latitude: 37.5, longitude: 127 },
  ]
  const next = place.applyPhotoPlacePrecision(route, photos, 'exact')
  assert.deepEqual(next[0], { name: '사진 1의 장소', ...exact, photoIndex: 0 })
  assert.strictEqual(next[1], route[1])
  assert.strictEqual(next[2], route[2])
  assert.strictEqual(place.applyPhotoPlacePrecision(next, photos, 'exact'), next)
  assert.deepEqual(place.applyPhotoPlacePrecision(next, photos, 'area')[0], route[0])
})

test('사진 순서가 바뀌거나 사진을 지우면 자동 이름만 따라 바뀌고 직접 쓴 이름은 유지함', () => {
  const a = new File(['첫째'], 'a.jpg')
  const b = new File(['둘째'], 'b.jpg')
  const route = [
    { name: '사진 2의 장소', latitude: 37.51, longitude: 127.05, photoIndex: 1 },
    { name: '사진 2의 장소 앞 벤치', latitude: 37.5, longitude: 127, photoIndex: 1 },
  ]
  const swapped = reindexCommunityRoutePhotos(route, [a, b], [b, a])
  assert.deepEqual(
    swapped.map((point) => [point.name, point.photoIndex]),
    [
      ['사진 1의 장소', 0],
      ['사진 2의 장소 앞 벤치', 0],
    ],
  )
  const removed = reindexCommunityRoutePhotos(route, [a, b], [a])
  assert.deepEqual(
    removed.map((point) => [point.name, point.photoIndex]),
    [
      ['사진에서 담은 장소', undefined],
      ['사진 2의 장소 앞 벤치', undefined],
    ],
  )
})

test('촬영 시각을 아는 장소끼리만 시간 순으로 바꾸고 나머지는 자리를 지킴', () => {
  const photos = [
    photo(0, { takenAt: 300 }),
    photo(1, { takenAt: 100 }),
    photo(2),
    photo(3, { takenAt: 200 }),
  ]
  const point = (name, photoIndex) => ({ name, latitude: 37.5, longitude: 127, photoIndex })
  const route = [
    point('가', 0),
    { name: '검색 장소', latitude: 37, longitude: 127 },
    point('나', 1),
    point('다', 2),
    point('라', 3),
  ]
  const sorted = place.sortRouteByPhotoTime(route, photos)
  assert.deepEqual(
    sorted.map((row) => row.name),
    ['나', '검색 장소', '라', '다', '가'],
  )
  assert.strictEqual(place.sortRouteByPhotoTime(sorted, photos), sorted)
  assert.equal(place.canSortRouteByPhotoTime(sorted, photos), false)
  assert.equal(place.canSortRouteByPhotoTime(route, photos), true)
  assert.strictEqual(place.sortRouteByPhotoTime([point('가', 0), point('다', 2)], photos).length, 2)
  assert.equal(place.canSortRouteByPhotoTime([point('가', 0), point('다', 2)], photos), false)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const exifr = require('exifr')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const { photoWithGps } = require('./fixtures/photo-location.fixture.cjs')
const location = load('src/features/community/lib/communityPhotoLocation.ts', {
  exifr: { gps: async (file) => exifr.gps(await file.arrayBuffer()) },
})

test('실제 사진 위치 메타데이터의 도분초와 남서 방향을 좌표로 읽음', async () => {
  for (const negative of [false, true]) {
    const photo = new File([photoWithGps(undefined, negative, negative)], '산책.jpg', {
      type: 'image/jpeg',
    })
    assert.deepEqual(await location.readCommunityPhotoLocation(photo), {
      latitude: negative ? -37.5 : 37.5,
      longitude: negative ? -127 : 127,
    })
  }
})

test('위치가 없거나 손상된 사진은 위치를 추측하지 않음', async () => {
  for (const bytes of [Buffer.from([0xff, 0xd8, 0xff, 0xd9]), Buffer.from('손상된 사진')]) {
    assert.equal(
      await location.readCommunityPhotoLocation(new File([bytes], '산책.jpg')),
      undefined,
    )
  }
})

test('좌표 범위와 숫자를 검사하고 공개 후보의 정밀도를 제한함', () => {
  for (const value of [
    null,
    {},
    { latitude: 0, longitude: 0 },
    { latitude: '37', longitude: 127 },
    { latitude: NaN, longitude: 127 },
    { latitude: 91, longitude: 127 },
    { latitude: 37, longitude: -181 },
  ]) {
    assert.equal(location.toCommunityPhotoLocation(value), undefined)
  }
  assert.deepEqual(
    location.toCommunityPhotoLocation({ latitude: 37.51234567, longitude: 127.01234567 }),
    { latitude: 37.5123, longitude: 127.0123 },
  )
})

test('원본에서 위치를 읽고 메타데이터를 제거한 업로드 사본에만 후보를 연결함', async () => {
  const source = new File([photoWithGps()], '산책.jpg', { type: 'image/jpeg' })
  const cleaned = new File(['합성 변환 결과'], '산책.jpg', { type: 'image/jpeg' })
  const steps = []
  const prepare = load('src/features/community/lib/prepareCommunityPhoto.ts', {
    '@/shared/lib/preparePhoto': {
      validatePhoto: () => steps.push('검증'),
      preparePhoto: async (file) => {
        assert.equal(file, source)
        steps.push('변환')
        return cleaned
      },
    },
    './communityPhotoLocation': {
      ...location,
      readCommunityPhotoLocation: async (file) => {
        steps.push('원본 위치 읽기')
        return location.readCommunityPhotoLocation(file)
      },
    },
  }).prepareCommunityPhoto
  assert.equal(await prepare(source), cleaned)
  assert.deepEqual(steps, ['검증', '원본 위치 읽기', '변환'])
  assert.equal(location.getCommunityPhotoLocation(source), undefined)
  assert.deepEqual(location.getCommunityPhotoLocation(cleaned), { latitude: 37.5, longitude: 127 })
})

test('사진 재정렬과 삭제 및 비교 원본 제외 후에도 장소는 같은 사진을 가리킴', () => {
  const { reindexCommunityRoutePhotos } = load(
    'src/features/community/lib/communityRoutePhotos.ts',
    {
      './communityPhotoPlace': load('src/features/community/lib/communityPhotoPlace.ts'),
    },
  )
  const a = new File(['첫째'], '같은이름.jpg'),
    b = new File(['둘째'], '같은이름.jpg')
  const place = { name: '공개 공원', latitude: 37.5, longitude: 127, photoIndex: 1 }
  assert.equal(reindexCommunityRoutePhotos([place], [a, b], [b, a])[0].photoIndex, 0)
  assert.equal(reindexCommunityRoutePhotos([place], [a, b], [a])[0].photoIndex, undefined)
  assert.equal(reindexCommunityRoutePhotos([place], [a, b], [a])[0].name, '공개 공원')
  assert.equal(place.photoIndex, 1)
})

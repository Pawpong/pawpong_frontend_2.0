const { test } = require('node:test')
const assert = require('node:assert/strict')
const exifr = require('exifr')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const { photoWithGps, photoWithTakenAt } = require('./fixtures/photo-location.fixture.cjs')

const realExifr = {
  gps: async (file) => exifr.gps(await file.arrayBuffer()),
  parse: async (file, options) => exifr.parse(await file.arrayBuffer(), options),
}
const location = load('src/features/community/lib/communityPhotoLocation.ts', { exifr: realExifr })
const jpeg = (bytes, name = '산책.jpg', type = 'image/jpeg') => new File([bytes], name, { type })

test('원본 사진의 촬영 시각을 기기 안에서 읽음', async () => {
  const takenAt = await location.readCommunityPhotoTakenAt(
    jpeg(photoWithTakenAt('2025:05:01 10:20:00')),
  )
  assert.equal(takenAt, new Date(2025, 4, 1, 10, 20, 0).getTime())
})

test('비어 있거나 잘못된 촬영 시각과 미래 시각은 믿지 않음', async () => {
  for (const text of ['0000:00:00 00:00:00', '    :  :     :  :  ', '2025:13:45 99:99:99'])
    assert.equal(
      await location.readCommunityPhotoTakenAt(jpeg(photoWithTakenAt(text))),
      undefined,
      text,
    )
  const now = new Date(2026, 9, 9, 12).getTime()
  for (const value of [
    undefined,
    null,
    new Date(2025, 4, 1),
    1714500000000,
    '2025-05-01 10:20:00',
    '2025:02:30 10:20:00',
    '2025:05:01 24:00:00',
    '1970:01:01 00:00:00',
  ])
    assert.equal(location.toCommunityPhotoTakenAt(value, now), undefined, String(value))
  assert.equal(location.toCommunityPhotoTakenAt('2026:10:11 12:00:00', now), undefined)
  assert.equal(
    location.toCommunityPhotoTakenAt('2026:10:09 11:59:59', now),
    new Date(2026, 9, 9, 11, 59, 59).getTime(),
  )
})

test('메타데이터가 없는 스크린샷이나 읽지 못하는 고효율 사진은 위치와 시각을 만들지 않음', async () => {
  const screenshot = new File([Buffer.from('89504e470d0a1a0a', 'hex')], '스크린샷.png', {
    type: 'image/png',
  })
  const heic = new File([Buffer.from('합성 고효율 사진')], '산책.heic', { type: 'image/heic' })
  for (const file of [screenshot, heic]) {
    assert.equal(await location.readCommunityPhotoLocation(file), undefined)
    assert.equal(await location.readCommunityPhotoTakenAt(file), undefined)
  }
  const broken = load('src/features/community/lib/communityPhotoLocation.ts', {
    exifr: {
      gps: async () => {
        throw new Error('분석 실패')
      },
      parse: async () => {
        throw new Error('분석 실패')
      },
    },
  })
  assert.equal(await broken.readCommunityPhotoLocation(jpeg(photoWithGps())), undefined)
  assert.equal(await broken.readCommunityPhotoTakenAt(jpeg(photoWithTakenAt())), undefined)
})

test('촬영 시각도 원본에서 읽고 메타데이터를 지운 업로드 사본에만 연결함', async () => {
  const source = jpeg(photoWithTakenAt('2025:05:01 10:20:00'))
  const cleaned = jpeg('합성 변환 결과')
  const steps = []
  const prepare = load('src/features/community/lib/prepareCommunityPhoto.ts', {
    '@/shared/lib/preparePhoto': {
      validatePhoto: () => steps.push('검증'),
      preparePhoto: async () => {
        steps.push('변환')
        return cleaned
      },
    },
    './communityPhotoLocation': {
      ...location,
      readCommunityPhotoTakenAt: async (file) => {
        steps.push('원본 시각 읽기')
        return location.readCommunityPhotoTakenAt(file)
      },
    },
  }).prepareCommunityPhoto
  assert.equal(await prepare(source), cleaned)
  assert.deepEqual(steps, ['검증', '원본 시각 읽기', '변환'])
  assert.equal(location.getCommunityPhotoTakenAt(source), undefined)
  assert.equal(location.getCommunityPhotoTakenAt(cleaned), new Date(2025, 4, 1, 10, 20).getTime())
  assert.equal(location.getCommunityPhotoLocation(cleaned), undefined)
})

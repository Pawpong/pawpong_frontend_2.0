const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const ui = 'src/app/(main)/community/_ui'
const read = (file) => fs.readFileSync(file, 'utf8')
const visibleFiles = [
  `${ui}/CommunityRoutePicker.tsx`,
  `${ui}/CommunityPhotoPlaces.tsx`,
  `${ui}/CommunityExperienceEditor.tsx`,
  `${ui}/CommunityExperiencePanel.tsx`,
  `${ui}/CommunityDiscovery.tsx`,
  `${ui}/discovery/constants.ts`,
  'src/features/care-map/ui/SharedRouteMap.tsx',
]

test('사진 장소를 이은 선을 산책 코스나 실제 경로처럼 부르지 않음', () => {
  for (const file of visibleFiles)
    assert.doesNotMatch(read(file), /코스|산책 경로|소요 시간|km 걸었/, file)
  const panel = read(`${ui}/CommunityExperiencePanel.tsx`)
  assert.match(panel, /방문 순서대로 이은 참고선/)
  assert.match(panel, /실제 걸은 길이나 거리,\s+길 안내가 아니며/)
})

test('사진 위치는 기본으로 동네 정도만 담고 정밀도를 바꾸면 공개 확인을 다시 받음', () => {
  const picker = read(`${ui}/CommunityRoutePicker.tsx`)
  assert.match(picker, /useState<CommunityPhotoPlacePrecision>\('area'\)/)
  assert.match(picker, /applyPhotoPlacePrecision\(route, photos, next\)[\s\S]*setRoute\(moved\)/)
  assert.match(picker, /onChange\(\{ route: next, publicPlaceConfirmed: false \}\)/)
})

test('장소를 모두 빼면 위치 공유가 꺼지고 사진이 그대로일 때만 되돌릴 수 있음', () => {
  const picker = read(`${ui}/CommunityRoutePicker.tsx`)
  assert.match(picker, /장소 모두 빼고 위치 공유 끄기/)
  assert.match(picker, /setRoute\(\[\]\)/)
  assert.match(picker, /const undo = cleared\?\.photoKey === photoKey \? cleared\.route : null/)
  assert.match(picker, /route: undo, publicPlaceConfirmed: false/)
})

test('이미 올린 사진과 위치 없는 새 사진과 앱 화면을 구분해 안내함', () => {
  const places = read(`${ui}/CommunityPhotoPlaces.tsx`)
  assert.match(places, /위치를 추측하지 않으니 지도에서/)
  assert.match(places, /이미 올린 사진은 위치 정보를 지운 사본만/)
  // 앱 사진 선택기는 위치를 지워 전달할 수 있고 사진 권한으로 해결되지 않으므로 권한 설정을 권하지 않는다
  assert.match(places, /촬영 위치가 빠진 채 전달될 수 있어요/)
  assert.doesNotMatch(places, /사진 접근을 허용/)
  assert.match(places, /나만 보여요/)
  const editor = read(`${ui}/CommunityPostEditor.tsx`)
  assert.match(editor, /\{ photoIndex, previewUrl: form\.images\[photoIndex\], saved: true \}/)
  assert.match(editor, /takenAt: getCommunityPhotoTakenAt\(photo\)/)
})

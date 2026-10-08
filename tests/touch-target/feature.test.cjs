const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')

const read = (file) => fs.readFileSync(file, 'utf8')
const ui = 'src/app/(main)/community/_ui'

test('커뮤니티 알약 버튼과 활동 단계 진입 링크는 공통 터치 영역을 씀', () => {
  for (const file of [
    `${ui}/discovery/FilterControls.tsx`,
    `${ui}/CommunityFeedMeta.tsx`,
    `${ui}/CommunityExperiencePanel.tsx`,
    `${ui}/CommunityRecordFields.tsx`,
    `${ui}/CommunityExperienceEditor.tsx`,
    'src/features/gamification/ui/ActivityEntry.tsx',
  ]) {
    const code = read(file)
    assert.match(code, /touch-target/, file)
    assert.match(code, /\brelative\b/, file)
  }
})

test('가로 스크롤 줄은 터치 영역이 잘리지 않게 여유를 두되 바깥 배치는 그대로 둠', () => {
  assert.match(
    read(`${ui}/CommunityDiscovery.tsx`),
    /-mt-0\.5 flex min-w-0 flex-1 gap-2 overflow-x-auto pt-0\.5 pb-1/,
  )
  // 기존 pb-1(4px)+mb-6(24px)=28px을 pb-2(8px)+mb-5(20px)로 같은 간격 유지
  assert.match(
    read(`${ui}/CommunityContent.tsx`),
    /-mt-2 mb-5 flex gap-2 overflow-x-auto pt-2 pb-2 pc:hidden/,
  )
})

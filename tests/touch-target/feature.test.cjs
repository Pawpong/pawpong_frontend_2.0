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
  const discovery = read(`${ui}/CommunityDiscovery.tsx`)
  // 동물 타일 줄은 포커스 테두리가 잘리지 않게 띠 안쪽 여유(p-1.5)를 둔다 — PC 는 사이드바가 맡는다
  assert.match(discovery, /grid grid-cols-4 gap-0\.5 bg-secondary-50 p-1\.5 pc:hidden/)
  // 띠 안 카테고리(윗줄)·말머리(아랫줄) 탭은 모두 공통 터치 영역을 쓴다
  assert.match(
    discovery,
    /touch-target relative inline-flex min-h-9 shrink-0 items-center gap-1\.5 rounded-lg px-2\.5 text-body-sm whitespace-nowrap focus-ring/,
  )
  assert.match(
    discovery,
    /touch-target relative min-h-10 shrink-0 px-2\.5 text-body-sm whitespace-nowrap focus-ring/,
  )
  // 말머리 밑줄은 touch-target 의 ::after 와 겹치지 않게 ::before 로 그린다
  assert.match(discovery, /before:absolute before:inset-x-2\.5 before:bottom-1\.5 before:h-0\.5/)
  assert.doesNotMatch(discovery, /after:absolute/)
})

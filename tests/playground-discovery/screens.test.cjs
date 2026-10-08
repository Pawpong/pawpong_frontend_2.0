const { test } = require('node:test')
const assert = require('node:assert/strict')
const { allCards, source } = require('./fixtures/discovery.fixture.cjs')

const ui = 'src/features/playground-tools/ui'
const playFiles = [
  `${ui}/OutingDiscovery.tsx`,
  `${ui}/PetTasteDiscovery.tsx`,
  `${ui}/PlayResultActions.tsx`,
  `${ui}/PlayResultCard.tsx`,
  'src/features/playground-tools/model/discovery.ts',
  'src/features/playground-tools/lib/sharePlayCard.ts',
]

test('놀이 카드는 서버 요청이나 활동 보상 없이 화면 안에서만 동작함', () => {
  for (const file of playFiles) {
    const code = source(file)
    assert.doesNotMatch(
      code,
      /@\/shared\/api|axios|fetch\(|useMutation|entities\/gamification'|grantExp|achievement/i,
      file,
    )
    assert.doesNotMatch(code, /localStorage|sessionStorage/, file)
  }
})

test('놀이 카드 문구는 건강·응급 판단을 놀이로 만들지 않음', () => {
  for (const card of allCards()) {
    const text = [card.title, card.description, ...card.moments, card.memoryMessage].join(' ')
    assert.doesNotMatch(text, /진단|증상|응급|치료|질병|약 먹|병원/, card.id)
    assert.doesNotMatch(text, /경험치|EXP|업적|레벨/, card.id)
  }
})

test('기존 외출 준비함 주소와 저장 데이터는 그대로 두고 새 놀이는 별도 주소를 씀', () => {
  assert.match(source('src/app/(main)/playground/outing/page.tsx'), /<OutingChecklist \/>/)
  assert.match(source('src/app/(main)/playground/walk-card/page.tsx'), /<OutingDiscovery \/>/)
  assert.match(source('src/app/(main)/playground/taste/page.tsx'), /<PetTasteDiscovery \/>/)
  assert.match(
    source('src/features/playground-tools/model/checklistStore.ts'),
    /`pawpong:outing:v1:\$\{encodeURIComponent\(owner\)\}`/,
  )
  for (const file of playFiles) assert.doesNotMatch(source(file), /outing\/checklist/, file)
})

test('결과 화면은 추억 카드, AI 사진, 방, 산책 공유로 이어지고 공유 실패 시 직접 복사를 제공함', () => {
  const actions = source(`${ui}/PlayResultActions.tsx`)
  for (const href of [
    '/ai-filter',
    '/playground/pet',
    '/community/write?experience=walk',
    '/playground/walk-card',
  ])
    assert.ok(actions.includes(href), href)
  assert.match(actions, /memoryCardHref\(card\)/)
  assert.match(actions, /role="status"/)
  assert.match(actions, /<Textarea[\s\S]*readOnly/)
})

test('카드 연출은 움직임 줄이기 설정에서 멈추고 결과 제목으로 포커스를 옮김', () => {
  const css = source(`${ui}/Discovery.module.css`)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*{[^}]*\.reveal/)
  for (const file of [`${ui}/OutingDiscovery.tsx`, `${ui}/PetTasteDiscovery.tsx`]) {
    const code = source(file)
    assert.match(code, /tabIndex=\{-1\}/, file)
    assert.match(code, /focus\(\{ preventScroll: true \}\)/, file)
    assert.match(code, /RadioCardGroup/, file)
  }
})

test('공통 선택 카드는 기본으로 필수 표시를 유지하고 놀이에서만 끌 수 있음', () => {
  const group = source('src/shared/ui/RadioCardGroup.tsx')
  assert.match(group, /required = true/)
  assert.match(group, /\{required && <span[^>]*>필수<\/span>\}/)
  assert.doesNotMatch(
    source('src/widgets/adoption-form/ui/HealthStatusBlock.tsx'),
    /required=\{false\}/,
  )
})

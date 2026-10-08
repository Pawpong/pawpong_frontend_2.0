const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

const css = () => source('src/features/playground-tools/ui/Tools.module.css')

test('놀이터 도구 스타일은 공통 브레이크포인트와 focus-ring 두께를 따르고 지운 선반 규칙을 남기지 않음', () => {
  const styles = css()
  assert.doesNotMatch(styles, /min-width: (760|1080)px/)
  assert.match(styles, /@media \(min-width: 768px\)/)
  assert.match(styles, /@media \(min-width: 1024px\)/)
  assert.match(
    styles,
    /outline: 2px solid var\(--color-primary-500, #ad651d\);\s*outline-offset: 2px;/,
  )
  assert.doesNotMatch(styles, /outline: 3px/)
  assert.doesNotMatch(styles, /\.(shelf|toolCard|recordShelf|iconButton)\b/)
  assert.doesNotMatch(styles, /min-height: (28|32)px/)
})

test('외출 준비함은 공통 아이콘 버튼과 그룹 이름을 쓰고 장식 기호를 읽지 않게 함', () => {
  const checklist = source('src/features/playground-tools/ui/OutingChecklist.tsx')
  assert.match(checklist, /<IconButton\s+size="touch"\s+tone="danger"/)
  assert.match(checklist, /role="group" aria-label="외출 목적"/)
  assert.match(checklist, /<span aria-hidden>\u2197<\/span>/)
})

test('버튼 폭은 계약을 우회하지 않고 감싸는 칸으로 정하며 이야기 쓰기 버튼은 줄을 채움', () => {
  for (const file of [
    'src/app/(main)/playground/_ui/PlaygroundContent.tsx',
    'src/features/playground-tools/ui/PlayResultActions.tsx',
  ])
    assert.doesNotMatch(source(file), /cn\(buttonVariants/, file)
  const memory = source('src/features/playground-tools/ui/MemoryCard.tsx')
  assert.match(memory, /intent="secondary"\s+width="full"\s+disabled=\{!cardReady\}/)
})

test('반려동물 방의 캐릭터 연결 패널로 이동하면 고정 헤더와 화면 아래에서 시작함', () => {
  const room = source('src/features/playground-pet/ui/PetRoom.module.css')
  assert.match(room, /\.contentPanels > section\[id\] \{\s*scroll-margin-top: 76px;/)
  assert.match(
    room,
    /\.contentPanels > section\[id\] \{\s*scroll-margin-top: calc\(var\(--pet-sticky-top/,
  )
})

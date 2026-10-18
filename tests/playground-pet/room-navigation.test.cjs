const fs = require('node:fs')
const { test, assert } = require('./fixtures/core.fixture.cjs')

// 방 화면 원문은 PetRoom과 거기서 나눈 방 요약·기록 패널을 함께 본다.
const room = () =>
  ['PetRoom', 'PetRoomSummary', 'PetRecords']
    .map((name) => fs.readFileSync(`src/features/playground-pet/ui/${name}.tsx`, 'utf8'))
    .join('\n')

test('탭을 옮기면 방 위에서 고른 자리 요청을 지워 다시 열 때 예전 자리로 좁혀지지 않음', () => {
  const code = room()
  assert.match(
    code,
    /function setTab\(tab: PetTab\) \{\s*navigation\.selectTab\(tab\)\s*setItem\(null\)\s*setSlotRequest\(null\)/,
  )
})

test('패널 안 바로가기는 사라지는 버튼 대신 새로 고른 탭으로 포커스를 옮김', () => {
  const code = room()
  assert.match(code, /document\.getElementById\(`pet-tab-\$\{tab\}`\)\?\.focus\(\)/)
  assert.match(code, /onOpenTab=\{openTab\}/)
  for (const tab of ['decorate', 'games', 'shop'])
    assert.match(code, new RegExp(`onClick=\\{\\(\\) => onOpenTab\\('${tab}'\\)\\}`))
})

test('보유 소품이 없어 상점으로 갈 때는 보던 자리를 함께 넘김', () => {
  const decorations = fs.readFileSync('src/features/playground-pet/ui/PetDecorations.tsx', 'utf8')
  assert.match(
    decorations,
    /onOpenShop\?\.\(filters\.slot === 'all' \? undefined : filters\.slot\)/,
  )
  assert.match(
    room(),
    /if \(slot\)\s*setSlotRequest\(\(current\) => \(\{ slot, serial: \(current\?\.serial \?\? 0\) \+ 1 \}\)\)/,
  )
})

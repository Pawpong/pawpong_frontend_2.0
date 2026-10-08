const fs = require('node:fs')
const { test, assert, presentation } = require('./fixtures/core.fixture.cjs')

const room = () => fs.readFileSync('src/features/playground-pet/ui/PetRoom.tsx', 'utf8')
const at = (iso) => Date.parse(iso)

test('함께한 날은 입양한 한국 날짜를 1일째로 세고 이번 주 방문 수와 섞지 않음', () => {
  // 한국 시간 10월 1일 23시 입양 → 10월 9일 낮은 9일째
  assert.equal(presentation.petDaysTogether('2026-10-01T14:00:00Z', '2026-10-09T03:00:00Z'), 9)
  // 같은 한국 날짜 안에서는 1일째
  assert.equal(presentation.petDaysTogether('2026-10-08T15:30:00Z', '2026-10-09T14:59:00Z'), 1)
  for (const [createdAt, serverTime] of [
    ['날짜 아님', '2026-10-09T03:00:00Z'],
    ['2026-10-09T03:00:00Z', '2026-10-01T03:00:00Z'],
  ])
    assert.equal(presentation.petDaysTogether(createdAt, serverTime), null)
  const code = room()
  assert.match(code, /함께한 지 \$\{daysTogether\}일째예요/)
  assert.match(code, /이번 주에는 \$\{view\.week\.daysTogether\}일 만났어요/)
  assert.doesNotMatch(code, /\{view\.week\.daysTogether\}일째 함께하고 있어요/)
})

test('돌봄 버튼의 기다림 표시는 시간 단위와 이유를 짧게 알려줌', () => {
  const now = at('2026-10-09T03:00:00Z')
  const wait = (minutes, extra = {}) => ({
    allowed: false,
    nextAvailableAt: new Date(now + minutes * 60000).toISOString(),
    ...extra,
  })
  assert.equal(presentation.petWaitShort({ allowed: true, nextAvailableAt: null }, now), null)
  assert.equal(presentation.petWaitShort(wait(9.2), now), '10분 뒤')
  assert.equal(presentation.petWaitShort(wait(80), now), '1시간 20분 뒤')
  assert.equal(presentation.petWaitShort(wait(360), now), '6시간 뒤')
  assert.equal(
    presentation.petWaitShort({ allowed: false, nextAvailableAt: null, reason: 'LOW_ENERGY' }, now),
    '쉬고 나서',
  )
  assert.equal(
    presentation.petWaitShort(
      { allowed: false, nextAvailableAt: null, reason: 'DAILY_LIMIT' },
      now,
    ),
    '내일',
  )
  assert.equal(presentation.petWaitShort({ allowed: false, nextAvailableAt: null }, now), null)
  assert.match(
    fs.readFileSync('src/features/playground-pet/ui/PetRoom.module.css', 'utf8'),
    /\.careButton small \{[^}]*font-size: 11px;/,
  )
})

test('지금 할 수 없는 돌봄은 권하지 않고 가능한 시점을 알려주며 말풍선도 멈춤', () => {
  const code = room()
  assert.match(
    code,
    /const moodPossible = !mood\?\.action \|\| Boolean\(moodAvailability\?\.allowed\)/,
  )
  assert.match(code, /mood: moodPossible \? \(mood\?\.kind \?\? null\) : null/)
  assert.match(code, /는 \$\{moodWait \?\? '조금 뒤'\} 할 수 있어요/)
})

test('오늘의 돌봄 막대는 완료한 돌봄 수를 보여주고 열리는 콘텐츠가 없는 기록은 숨김', () => {
  const code = room()
  assert.match(
    code,
    /value=\{view\.daily\.quests\.filter\(\(quest\) => quest\.completed\)\.length\}/,
  )
  assert.match(code, /aria-label=\{`오늘의 돌봄 \$\{/)
  assert.match(code, /\.filter\(\(record\) => record\.type !== 'unlock'\)/)
})

test('성공 안내는 4초 뒤 지우되 오류와 결과 확인 안내는 남김', () => {
  const controller = fs.readFileSync('src/features/playground-pet/lib/usePetController.ts', 'utf8')
  assert.match(controller, /export const PET_SUCCESS_NOTICE_MS = 4000/)
  assert.match(controller, /if \(!notice \|\| notice !== successNotice\.current\) return/)
  const success = controller.slice(
    controller.indexOf('if (gameOutcome) {'),
    controller.indexOf('// 재전송 원 응답의'),
  )
  assert.doesNotMatch(success, /setNotice\(/)
  const failure = controller.slice(controller.indexOf("} else if (result.type !== 'busy') {"))
  assert.match(failure, /setNotice\(/)
  assert.doesNotMatch(failure, /showSuccess\(/)
})

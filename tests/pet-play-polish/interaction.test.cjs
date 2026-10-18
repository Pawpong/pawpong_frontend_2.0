const { test } = require('node:test')
const assert = require('node:assert/strict')
const { room, snack } = require('./fixtures/model.fixture.cjs')

test('슬롯 핫스팟은 방 안에 있고 가구가 그려지는 자리와 같다', () => {
  assert.deepEqual(Object.keys(room.PET_SLOT_AREAS).sort(), [...room.PET_SLOTS].sort())
  for (const area of Object.values(room.PET_SLOT_AREAS)) {
    assert.ok(area.x >= 0 && area.y >= 0)
    assert.ok(area.x + area.width <= 320 && area.y + area.height <= 224)
  }
  for (const [slot, position] of Object.entries(room.PET_SLOT_POSITIONS)) {
    const area = room.PET_SLOT_AREAS[slot]
    assert.equal(area.x + area.width / 2, position.x)
    assert.equal(area.y + area.height, position.y)
  }
  assert.deepEqual(room.petStagePoint(0.5, 0.5), { x: 160, y: 112 })
  assert.equal(room.petStagePoint(1.2, 0.5), null)
  assert.equal(room.petStagePoint(Number.NaN, 0.5), null)
})

test('간식 터치는 한 칸 이동이며 낙하 연출 판정은 서버 재생 규칙과 같다', () => {
  assert.equal(snack.snackTapDirection(0.1), -1)
  assert.equal(snack.snackTapDirection(0.9), 1)
  const session = {
    drops: [
      { lane: 1, landingAtMs: 2000, kind: 'snack' },
      { lane: 2, landingAtMs: 3000, kind: 'hazard' },
      { lane: 0, landingAtMs: 4000, kind: 'snack' },
    ],
  }
  const inputs = [{ tMs: 2500, lane: 2 }]
  const lanes = [1, 2, 2]
  const results = session.drops.map((drop, index) => snack.snackDropResult(drop, lanes[index]))
  assert.deepEqual(results, ['catch', 'hazard', 'miss'])
  const preview = snack.previewSnack(session, inputs, 30_000)
  assert.equal(preview.catches, results.filter((value) => value === 'catch').length)
  assert.equal(preview.hazards, results.filter((value) => value === 'hazard').length)
  assert.equal(preview.misses, results.filter((value) => value === 'miss').length)
  assert.equal(snack.snackDropResult({ lane: 0, kind: 'hazard' }, 1), 'dodge')
  // 터치도 기존 입력 규칙(80ms 간격·인접 칸·범위)을 그대로 지난다.
  assert.equal(
    snack.nextSnackInput([{ tMs: 100, lane: 2 }], 2, snack.snackTapDirection(0.9), 400),
    null,
  )
  assert.equal(
    snack.nextSnackInput([{ tMs: 100, lane: 2 }], 2, snack.snackTapDirection(0.1), 150),
    null,
  )
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadModule: load } = require('./helpers/load-module.cjs')
const settings = load('src/features/playground-pet/constants/pet-motion.ts')
const { initialPetMotion, advancePetMotion } = load(
  'src/features/playground-pet/lib/petMotion.ts',
  { '../constants/pet-motion': settings },
)
const input = (extra = {}) => ({
  time: 4000,
  delta: 33,
  resting: false,
  reducedMotion: false,
  reacting: false,
  ...extra,
})

test('캐릭터는 방보다 작게 표시하고 산책은 바닥의 안전한 범위에서 한다', () => {
  assert.ok(settings.PET_ROOM_MOTION.displaySize < 80)
  let state = initialPetMotion()
  const { bounds } = settings.PET_ROOM_MOTION
  for (let index = 0; index < 1500; index++) {
    const next = advancePetMotion(state, input({ time: 4000 + index * 33 }), () => 0.75)
    assert.ok(
      Math.hypot(next.x - state.x, next.y - state.y) <=
        settings.PET_ROOM_MOTION.speed * 0.033 + 0.01,
    )
    assert.ok(next.x >= bounds.left && next.x <= bounds.right)
    assert.ok(next.y >= bounds.top && next.y <= bounds.bottom)
    state = next
  }
})

test('숨긴 탭의 큰 시간 간격도 위치가 튀지 않고 도착 뒤에는 잠시 쉰다', () => {
  const first = advancePetMotion(initialPetMotion(), input({ delta: 60000 }), () => 1)
  assert.ok(Math.hypot(first.x - 130, first.y - 196) <= 1.61)
  const near = { ...first, x: first.targetX - 0.1, y: first.targetY, walking: true }
  const arrived = advancePetMotion(near, input(), () => 0)
  assert.equal(arrived.walking, false)
  assert.ok(arrived.nextWanderAt >= 6800)
})

test('움직임 감소와 간식 게임은 자동 산책이나 시각적인 충돌 이동을 하지 않는다', () => {
  const still = advancePetMotion(initialPetMotion(), input({ reducedMotion: true }), () => {
    throw new Error('임의 이동 없음')
  })
  assert.equal(still.x, 130)
  assert.equal(still.walking, false)
  const snack = advancePetMotion(still, input({ snackX: 240 }))
  assert.equal(snack.x, 240)
  assert.equal(snack.y, 213)
  assert.equal(snack.walking, false)
})

test('휴식은 침대까지 천천히 이동하고 반응 중에는 자리를 멈춘다', () => {
  const resting = advancePetMotion(initialPetMotion(), input({ resting: true }))
  assert.ok(resting.x > 130 && resting.x < 246)
  assert.equal(resting.walking, true)
  const reaction = advancePetMotion(resting, input({ reacting: true }))
  assert.equal(reaction.x, resting.x)
  assert.equal(reaction.walking, false)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadModule: load } = require('./helpers/load-module.cjs')
const settings = load('src/features/playground-pet/constants/pet-motion.ts')
const { initialPetMotion, advancePetMotion, petMotionPose } = load(
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

test('출발은 천천히 가속하고 목적지 앞에서는 속도를 줄인다', () => {
  let state = initialPetMotion()
  const first = advancePetMotion(state, input(), () => 1)
  assert.ok(first.speed > 0 && first.speed < settings.PET_ROOM_MOTION.speed / 10)
  assert.ok(Math.hypot(first.x - state.x, first.y - state.y) < 0.03)
  state = first
  let cruising = false
  let slowing = false
  for (let index = 1; index < 300 && state.walking; index++) {
    const next = advancePetMotion(state, input({ time: 4000 + index * 33 }), () => 1)
    assert.ok(next.speed <= settings.PET_ROOM_MOTION.speed)
    assert.ok(next.speed - state.speed <= settings.PET_ROOM_MOTION.acceleration * 0.033 + 0.001)
    if (next.speed === settings.PET_ROOM_MOTION.speed) cruising = true
    if (state.speed > next.speed && next.walking) slowing = true
    state = next
  }
  assert.equal(cruising, true)
  assert.equal(slowing, true)
  assert.equal(state.walking, false)
  assert.equal(state.speed, 0)
  assert.equal(state.x, state.targetX)
  assert.ok(state.nextWanderAt > 4000)
})

test('목적지 선택은 제자리 떨림을 피하고 난수 반복에도 유한하게 끝난다', () => {
  let samples = 0
  const state = advancePetMotion(initialPetMotion(), input(), () => {
    samples++
    return 0.5
  })
  assert.ok(Math.hypot(state.targetX - 130, state.targetY - 196) >= 24)
  assert.ok(samples <= 12)
  const invalid = advancePetMotion(initialPetMotion(), input(), () => Number.NaN)
  assert.ok(Number.isFinite(invalid.x))
  assert.ok(Number.isFinite(invalid.targetX))
})

test('반응 뒤에는 잠깐 쉬고 기존 목적지를 유지하며 다시 출발한다', () => {
  const walking = advancePetMotion(initialPetMotion(), input(), () => 1)
  const reacting = advancePetMotion(walking, input({ time: 4100, reacting: true }))
  const paused = advancePetMotion(reacting, input({ time: 4200 }), () => {
    throw new Error('반응 중에 목적지를 바꾸지 않음')
  })
  assert.equal(paused.x, reacting.x)
  assert.equal(paused.walking, false)
  const resumed = advancePetMotion(paused, input({ time: 4600 }), () => {
    throw new Error('이전 목적지로 이동함')
  })
  assert.equal(resumed.targetX, walking.targetX)
  assert.equal(resumed.targetY, walking.targetY)
  assert.equal(resumed.walking, true)
  assert.ok(resumed.speed < settings.PET_ROOM_MOTION.speed)
})

test('간식 게임 좌표는 정확히 유지하고 종료 뒤에는 방으로 천천히 돌아온다', () => {
  const snack = advancePetMotion(initialPetMotion(), input({ snackX: 240 }))
  assert.equal(snack.x, 240)
  assert.equal(snack.y, 213)
  const stopped = advancePetMotion(snack, input({ time: 5000 }))
  assert.equal(stopped.x, 240)
  assert.equal(stopped.y, 213)
  assert.equal(stopped.walking, false)
  const returned = advancePetMotion(stopped, input({ time: 5700 }))
  assert.ok(returned.x < 240 && returned.x > 239)
  assert.ok(returned.y < 213 && returned.y > 212)
  assert.equal(returned.targetX, settings.PET_ROOM_MOTION.home.x)
})

test('보폭은 시간만 바뀌어도 재생되지 않고 실제 이동 거리에 맞춰 진행한다', () => {
  const first = advancePetMotion(initialPetMotion(), input(), () => 1)
  const unchanged = advancePetMotion(first, input({ time: 50000, delta: 0 }))
  assert.equal(unchanged.gaitPhase, first.gaitPhase)
  assert.deepEqual(petMotionPose(unchanged, false, false), petMotionPose(first, false, false))
  const moved = advancePetMotion(first, input())
  const distance = Math.hypot(moved.x - first.x, moved.y - first.y)
  assert.ok(Math.abs(moved.gaitPhase - first.gaitPhase - (distance / 12) * Math.PI * 2) < 0.000001)
})

test('대기 호흡은 발 위치를 유지하고 움직임 감소는 모든 시각 변형을 멈춘다', () => {
  const resting = { ...initialPetMotion(), visualTime: 800 }
  const pose = petMotionPose(resting, false, false)
  assert.equal(pose.bob, 0)
  assert.equal(pose.angle, 0)
  assert.equal(pose.frame, 0)
  assert.ok(pose.height > 0)
  const still = petMotionPose(resting, true, false)
  assert.deepEqual(still, { frame: 0, bob: 0, angle: 0, width: 0, height: 0 })
})

test('다른 화면 주사율에서도 같은 이동을 유지하고 숨긴 탭에서는 시간이 튀지 않는다', () => {
  const advance = (hz) => {
    let state = initialPetMotion()
    for (let index = 0; index < hz * 2; index++)
      state = advancePetMotion(
        state,
        input({ time: 4000 + (index * 1000) / hz, delta: 1000 / hz }),
        () => 1,
      )
    return state
  }
  const low = advance(30)
  const high = advance(60)
  assert.ok(Math.hypot(low.x - high.x, low.y - high.y) < 0.02)
  const skipped = advancePetMotion(low, input({ delta: 60000 }))
  assert.equal(skipped.visualTime - low.visualTime, 100)
  assert.ok(Math.hypot(skipped.x - low.x, skipped.y - low.y) <= 1.61)
})

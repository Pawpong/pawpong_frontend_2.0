const { test } = require('node:test')
const assert = require('node:assert/strict')
const { settings, motion } = require('./fixtures/model.fixture.cjs')

test('부르면 바닥의 안전한 범위로만 걸어오고 휴식·간식 중에는 움직이지 않는다', () => {
  const { bounds } = settings.PET_ROOM_MOTION
  const start = motion.initialPetMotion()
  const called = motion.callPetTo(start, { x: 400, y: 10 })
  assert.equal(called.targetX, bounds.right)
  assert.equal(called.targetY, bounds.top)
  let state = called
  for (let index = 0; index < 60; index++)
    state = motion.advancePetMotion(
      state,
      { time: index * 33, delta: 33, resting: false, reducedMotion: false, reacting: false },
      () => 0.5,
    )
  assert.ok(state.x > start.x)
  assert.ok(state.x <= bounds.right)
  const busy = { ...start, mode: 'snack' }
  assert.equal(motion.callPetTo(busy, { x: 100, y: 190 }), busy)
  assert.equal(
    motion.callPetTo({ ...start, mode: 'bed' }, { x: 100, y: 190 }).targetX,
    start.targetX,
  )
})

test('가끔 장착한 소품 근처로 산책하되 범위를 벗어나지 않는다', () => {
  const { bounds } = settings.PET_ROOM_MOTION
  const values = [0, 0, 0.5]
  let cursor = 0
  const next = motion.advancePetMotion(
    motion.initialPetMotion(),
    {
      time: 10_000,
      delta: 33,
      resting: false,
      reducedMotion: false,
      reacting: false,
      visits: [{ x: 300, y: 190 }],
    },
    () => values[cursor++ % values.length],
  )
  assert.equal(next.targetX, bounds.right)
  assert.equal(next.targetY, 190)
})

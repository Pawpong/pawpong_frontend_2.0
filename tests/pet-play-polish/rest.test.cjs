const { test } = require('node:test')
const assert = require('node:assert/strict')
const { settings } = require('./fixtures/model.fixture.cjs')
const { engineHarness } = require('./fixtures/engine.fixture.cjs')

test('휴식은 침대에서 Zzz를 띄우고 움직임 감소에서는 침대에 멈춘 자세만 보여 준다', async () => {
  const previousImage = global.Image
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    await new Promise(setImmediate)
    const { bed } = settings.PET_ROOM_MOTION
    handle.sync({ ...harness.snapshot, resting: true, mood: 'resting' })
    harness.scene().update(1000, 33)
    assert.equal(harness.fx().rects.length, 0, '걸어가는 동안에는 Zzz가 없다')
    for (let time = 1033; time < 16_000; time += 33) harness.scene().update(time, 33)
    const hero = harness.hero()
    assert.equal(hero.x, bed.x)
    assert.equal(hero.frame, 5)
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0x6f7fb5),
      '침대에 도착하면 Zzz',
    )
    handle.destroy()

    const still = engineHarness()
    const reduced = still.createPetGame(
      {},
      { ...still.snapshot, resting: true, mood: 'resting', reducedMotion: true },
      () => {},
    )
    await new Promise(setImmediate)
    still.scene().update(1000, 33)
    assert.equal(still.hero().x, bed.x, '걷는 연출 없이 바로 침대')
    assert.equal(still.hero().frame, 5)
    still.scene().update(1900, 33)
    assert.equal(still.fx().rects.length, 0, 'Zzz·말풍선 같은 반복 연출 없음')
    reduced.sync({ ...still.snapshot, mood: 'hungry', reducedMotion: true })
    still.scene().update(2000, 33)
    assert.equal(still.hero().x, settings.PET_ROOM_MOTION.home.x)
    assert.equal(still.fx().rects.length, 0)
    reduced.destroy()
  } finally {
    global.Image = previousImage
  }
})

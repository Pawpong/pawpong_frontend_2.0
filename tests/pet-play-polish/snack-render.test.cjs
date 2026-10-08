const { test } = require('node:test')
const assert = require('node:assert/strict')
const { snack } = require('./fixtures/model.fixture.cjs')
const { engineHarness } = require('./fixtures/engine.fixture.cjs')

test('간식 낙하는 엔진이 origin에서 직접 계산하고 받음/빨간 공을 한 번만 연출한다', async () => {
  const previousImage = global.Image
  const previousPerformance = Object.getOwnPropertyDescriptor(globalThis, 'performance')
  let clock = 50_000
  Object.defineProperty(globalThis, 'performance', {
    configurable: true,
    value: { now: () => clock },
  })
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    const session = {
      sessionId: 'snack-1',
      durationMs: 30_000,
      drops: [
        { kind: 'snack', lane: 1, landingAtMs: 2000 },
        { kind: 'hazard', lane: 1, landingAtMs: 3000 },
        { kind: 'snack', lane: 0, landingAtMs: 4000 },
      ],
    }
    const active = { session, elapsed: 0, origin: 50_000, lane: 1 }
    handle.sync({ ...harness.snapshot, snack: active })
    await new Promise(setImmediate)
    const drops = harness.objects.filter((item) => item.depth === 30)
    assert.equal(drops.length, 3)
    clock = 51_000
    harness.scene().update(1000, 33)
    assert.equal(drops[0].visible, true)
    const early = drops[0].y
    clock = 51_500
    harness.scene().update(1500, 33) // React 상태 변화 없이도 내려온다
    assert.ok(drops[0].y > early)
    assert.equal(harness.hero().x, snack.SNACK_LANE_X[1])
    clock = 52_010
    harness.scene().update(2010, 33)
    assert.equal(drops[0].visible, false, '받은 간식은 사라진다')
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe7ba4b),
      '받음 반짝임',
    )
    clock = 53_020
    harness.scene().update(3020, 33)
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xb3443c),
      '빨간 공 표시',
    )
    assert.notEqual(harness.hero().angle, 0)
    handle.sync({ ...harness.snapshot, snack: { ...active, lane: 2 } })
    clock = 54_050
    harness.scene().update(4050, 33)
    assert.equal(drops[2].visible, true, '놓친 간식은 바닥까지 떨어진다')
    clock = 54_600
    harness.scene().update(4600, 33)
    assert.equal(drops[2].visible, false)
    assert.equal(
      harness.fx().rects.some((rect) => rect.color === 0xe7ba4b || rect.color === 0xb3443c),
      false,
      '지난 연출은 다시 나오지 않는다',
    )
    clock = 999_999
    harness.scene().update(5000, 33)
    assert.ok(
      drops.every((drop) => !drop.visible),
      '30초 뒤에는 낙하물이 남지 않는다',
    )
    handle.destroy()
  } finally {
    global.Image = previousImage
    if (previousPerformance) Object.defineProperty(globalThis, 'performance', previousPerformance)
  }
})

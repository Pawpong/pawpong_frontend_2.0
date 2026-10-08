const { test } = require('node:test')
const assert = require('node:assert/strict')
const { room } = require('./fixtures/model.fixture.cjs')
const { engineHarness } = require('./fixtures/engine.fixture.cjs')

test('방을 누르면 캐릭터는 폴짝 반응하고 바닥은 부르기, 게임·휴식·준비 전에는 반응하지 않는다', async () => {
  const previousImage = global.Image
  global.Image = class {
    set src(_value) {
      queueMicrotask(() => this.onload?.())
    }
  }
  try {
    const harness = engineHarness()
    const handle = harness.createPetGame({}, harness.snapshot, () => {})
    assert.equal(handle.poke(130, 170), null) // 아직 준비 전
    await new Promise(setImmediate)
    harness.scene().update(1000, 33)
    const hero = harness.hero()
    assert.equal(handle.poke(hero.x, hero.y - 28), 'pet')
    harness.scene().update(1200, 33)
    assert.ok(hero.y < 196, '쓰다듬으면 폴짝 뛴다')
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe9778a),
      '하트가 뜬다',
    )
    assert.equal(handle.poke(10, 40), null) // 벽은 부르기 대상이 아니다
    assert.equal(handle.poke(180, 200), 'call')
    handle.sync({ ...harness.snapshot, resting: true })
    assert.equal(handle.poke(hero.x, hero.y - 28), null)
    handle.sync({ ...harness.snapshot, reducedMotion: true })
    assert.equal(handle.poke(180, 200), null) // 움직임 감소: 자동 이동 없음
    handle.destroy()
    assert.equal(handle.poke(180, 200), null)
  } finally {
    global.Image = previousImage
  }
})

test('기분 말풍선·미리보기 강조·행동 반응은 그림만 바꾸고 움직임 감소에서는 깜빡이지 않는다', async () => {
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
    harness.scene().update(1000, 33)
    assert.equal(harness.fx().rects.length, 0)
    handle.sync({ ...harness.snapshot, mood: 'hungry' })
    harness.scene().update(1000, 33)
    assert.ok(harness.fx().rects.length > 4, '배고픔 말풍선')
    harness.scene().update(5000, 33)
    assert.equal(harness.fx().rects.length, 0, '말풍선은 계속 떠 있지 않는다')
    handle.sync({ ...harness.snapshot, highlight: 'bed' })
    harness.scene().update(8000, 33)
    const area = room.PET_SLOT_AREAS.bed
    assert.ok(
      harness.fx().rects.some((rect) => rect.x === area.x && rect.y === area.y),
      '미리보기 슬롯 모서리 표시',
    )
    harness.scene().update(8400, 33)
    assert.equal(harness.fx().rects.length, 0, '깜빡임')
    handle.sync({ ...harness.snapshot, highlight: 'bed', reducedMotion: true })
    harness.scene().update(8400, 33)
    assert.ok(harness.fx().rects.length > 0, '움직임 감소에서는 고정 표시')
    handle.sync({
      ...harness.snapshot,
      reaction: 1,
      feedback: { action: 'greet', stars: 0, xp: 8 },
    })
    harness.scene().update(9000, 33)
    harness.scene().update(9100, 33)
    assert.ok(
      harness.fx().rects.some((rect) => rect.color === 0xe9778a),
      '인사 하트',
    )
    handle.destroy()
  } finally {
    global.Image = previousImage
  }
})

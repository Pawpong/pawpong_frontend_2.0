const { test, assert, snack, room } = require('./fixtures/core.fixture.cjs')
const { engineFixture } = require('./fixtures/engine.fixture.cjs')

test('방 엔진은 인스턴스와 감소된 움직임 설정을 유지하고 정지된 루프도 정리함', async () => {
  const fixture = engineFixture()
  const { createPetGame, objects } = fixture
  try {
    let snapshot = {
      manifest: {
        assets: {
          wallpaper_cream: { url: '/playground/pet/v2/wallpaper_cream.png' },
          floor_oak: { url: '/playground/pet/v2/floor_oak.png' },
          toy_bone: { url: '/playground/pet/v2/slow-unselected.png' },
          toy_ball: { url: '/playground/pet/v2/unavailable.png' },
        },
      },
      room: { wallpaper: 'wallpaper_cream', floor: 'floor_oak' },
      characterUrl: 'blob:own-six-frame-sheet',
      resting: false,
      reaction: 0,
      feedback: { action: null, stars: 0, xp: 0 },
      reducedMotion: false,
      snack: null,
    }
    const states = []
    const handle = createPetGame({}, snapshot, (state) => states.push(state))
    await new Promise(setImmediate)
    assert.equal(states.at(-1), 'ready')
    const hero = objects.find((item) => item.kind === 'sprite'),
      sparks = objects.filter((item) => item.kind === 'graphics').at(-1)
    assert.ok(objects.find((item) => item.kind === 'graphics').sparkRects >= 10)
    fixture.instance.scene.update(3900, 0)
    assert.equal(hero.frame, 0)
    snapshot = { ...snapshot, reducedMotion: true }
    handle.sync(snapshot)
    fixture.instance.scene.update(1950)
    assert.equal(hero.frame, 0)
    snapshot = { ...snapshot, reaction: 1, feedback: { action: 'greet', stars: 6, xp: 4 } }
    handle.sync(snapshot)
    fixture.instance.scene.update(2000)
    assert.equal(hero.frame, 2)
    assert.equal(sparks.sparkRects, 0)
    handle.sync({ ...snapshot, resting: true })
    fixture.instance.scene.update(2050)
    assert.equal(hero.frame, 5)
    assert.equal(fixture.instances, 1)
    handle.destroy()
    handle.destroy()
    assert.equal(fixture.destroyed, 1)
    assert.equal(fixture.instance.pendingDestroy, false)
    const equippedStates = []
    const equipped = createPetGame({}, snapshot, (state) => equippedStates.push(state))
    await new Promise(setImmediate)
    assert.equal(equippedStates.at(-1), 'ready')
    equipped.sync({ ...snapshot, room: { ...snapshot.room, toy: 'toy_ball' } })
    await new Promise(setImmediate)
    assert.equal(equippedStates.at(-1), 'error')
    equipped.destroy()
    const booting = createPetGame({ awaitBoot: true }, snapshot, () => {})
    booting.destroy()
    assert.equal(fixture.destroyed, 2)
    fixture.instance.onReady()
    fixture.instance.isRunning = true
    await new Promise(setImmediate)
    assert.equal(fixture.destroyed, 3)
    assert.equal(fixture.instance.pendingDestroy, false)
    const failures = []
    const failed = createPetGame(
      {},
      {
        ...snapshot,
        characterUrl: null,
        manifest: {
          assets: {
            wallpaper_cream: { url: '/playground/pet/v2/unavailable.png' },
            floor_oak: { url: '/playground/pet/v2/floor_oak.png' },
          },
        },
      },
      (state) => failures.push(state),
    )
    await new Promise(setImmediate)
    assert.equal(failures.at(-1), 'error')
    assert.equal(objects.filter((item) => item.kind === 'tileSprite').at(-1).visible, true)
    assert.equal(objects.filter((item) => item.kind === 'sprite').at(-1).visible, false)
    assert.ok(objects.filter((item) => item.kind === 'graphics').at(-2).sparkRects >= 10)
    failed.destroy()
  } finally {
    fixture.dispose()
  }
})

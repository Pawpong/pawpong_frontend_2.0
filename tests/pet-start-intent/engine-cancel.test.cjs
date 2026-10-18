const { test } = require('node:test')
const assert = require('node:assert/strict')
const { pendingEngine, flush } = require('../pet-asset-timeout/fixtures/assets.fixture.cjs')

test('간식 그림 준비를 취소하면 오래 걸린 그림을 기다리지 않고 방과 짝 맞추기를 엶', async (t) => {
  const { handle, states, fixture } = pendingEngine(t)
  await flush()
  let oldResult = 'pending'
  void handle.prepareGame('snack').then((value) => {
    oldResult = value
  })
  await flush()
  assert.equal(states.at(-1), 'loading')
  handle.cancelPreparation()
  await flush()
  assert.equal(states.at(-1), 'ready')
  assert.equal(await handle.prepareGame('memory'), true)
  t.mock.timers.tick(15000)
  await flush()
  assert.equal(oldResult, false)
  assert.equal(states.at(-1), 'ready')
  assert.equal(fixture.instances, 1)
})

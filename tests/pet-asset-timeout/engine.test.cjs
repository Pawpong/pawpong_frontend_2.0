const { test } = require('node:test')
const assert = require('node:assert/strict')
const { flush, pendingEngine } = require('./fixtures/assets.fixture.cjs')

test('게임 그림이 멈춰도 준비 잠금을 풀고 같은 엔진에서 재시도함', async (t) => {
  const { handle, states, fixture, recover } = pendingEngine(t)
  await flush()
  let outcome = 'pending'
  void handle.prepareGame('snack').then((ready) => {
    outcome = ready
  })
  await flush()
  assert.equal(states.at(-1), 'loading')
  t.mock.timers.tick(15_000)
  await flush()
  assert.equal(outcome, false)
  assert.equal(states.at(-1), 'error')
  recover()
  assert.equal(await handle.prepareGame('snack'), true)
  assert.equal(states.at(-1), 'ready')
  assert.equal(fixture.instances, 1)
})

test('방을 떠나면 준비 작업을 즉시 종료하고 늦은 이미지 응답을 버림', async (t) => {
  const { handle, states, images, fixture } = pendingEngine(t)
  await flush()
  let outcome = 'pending'
  void handle.prepareGame('snack').then((ready) => {
    outcome = ready
  })
  await flush()
  const callbacks = images.map(({ image }) => image.onload)
  const before = states.length
  handle.destroy()
  await flush()
  assert.equal(outcome, false)
  for (const callback of callbacks) callback?.()
  t.mock.timers.tick(15_000)
  await flush()
  assert.equal(states.length, before)
  assert.equal(fixture.destroyed, 1)
  assert.ok(images.every(({ image }) => image.onload === null && image.onerror === null))
})

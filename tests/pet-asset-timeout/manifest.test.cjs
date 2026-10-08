const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadPetAssets } = require('../playground-pet-v2/fixtures/core.fixture.cjs')
const { flush } = require('./fixtures/assets.fixture.cjs')

for (const stage of ['요청', '본문']) {
  test(`그림 목록 ${stage}이 멈추면 제한 시간 뒤 종료하고 요청을 취소함`, async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const previous = global.fetch
    t.after(() => {
      global.fetch = previous
    })
    let signal
    global.fetch = async (_url, options) => {
      signal = options.signal
      if (stage === '요청') return new Promise(() => {})
      return { ok: true, json: () => new Promise(() => {}) }
    }
    let outcome = 'pending'
    void loadPetAssets(new AbortController().signal).then(
      () => {
        outcome = 'success'
      },
      () => {
        outcome = 'failed'
      },
    )
    await flush()
    t.mock.timers.tick(15_000)
    await flush()
    assert.equal(outcome, 'failed')
    assert.equal(signal.aborted, true)
  })
}

test('화면을 떠나면 응답 없는 그림 목록도 즉시 종료함', async (t) => {
  const previous = global.fetch
  t.after(() => {
    global.fetch = previous
  })
  global.fetch = () => new Promise(() => {})
  const controller = new AbortController()
  let outcome = 'pending'
  void loadPetAssets(controller.signal).catch(() => {
    outcome = 'cancelled'
  })
  await flush()
  controller.abort()
  await flush()
  assert.equal(outcome, 'cancelled')
})

test('이미 취소한 화면에서는 그림 목록을 요청하지 않음', async (t) => {
  const previous = global.fetch
  t.after(() => {
    global.fetch = previous
  })
  let requests = 0
  global.fetch = async () => {
    requests++
    throw new Error('호출 금지')
  }
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(loadPetAssets(controller.signal))
  assert.equal(requests, 0)
})

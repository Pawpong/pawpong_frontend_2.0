const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  deadline: { withPetAssetDeadline },
} = require('../fixtures/pet-assets.fixture.cjs')
const { flush } = require('./fixtures/assets.fixture.cjs')

test('정상 응답 뒤에는 제한 시간과 이탈 취소가 완료한 요청을 건드리지 않음', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const owner = new AbortController()
  let request
  assert.equal(
    await withPetAssetDeadline(owner.signal, async (signal) => {
      request = signal
      return 'ready'
    }),
    'ready',
  )
  owner.abort()
  t.mock.timers.tick(15_000)
  assert.equal(request.aborted, false)
})

test('오래 걸린 이전 요청의 늦은 완료가 새 요청의 성공을 바꾸지 않음', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const owner = new AbortController()
  let resolveOld
  const result = withPetAssetDeadline(
    owner.signal,
    () =>
      new Promise((resolve) => {
        resolveOld = resolve
      }),
  )
  const rejected = assert.rejects(result, /준비 시간이/)
  await flush()
  t.mock.timers.tick(15_000)
  await rejected
  assert.equal(owner.signal.aborted, false)
  assert.equal(await withPetAssetDeadline(owner.signal, async () => 'new'), 'new')
  resolveOld('old')
  await flush()
})

test('작업 실행 직전에 떠난 화면은 외부 요청을 시작하지 않음', async () => {
  const owner = new AbortController()
  let calls = 0
  const pending = withPetAssetDeadline(owner.signal, async () => {
    calls++
    return true
  })
  owner.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(calls, 0)
})

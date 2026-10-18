const {
  test,
  assert,
  ApiError,
  PetCommandQueue,
  command,
  view,
} = require('./fixtures/core.fixture.cjs')

test('처리 중 연속 클릭은 요청을 한 번만 전송함', async () => {
  let resolve,
    count = 0
  const queue = new PetCommandQueue(() => {
    count++
    return new Promise((done) => {
      resolve = done
    })
  })
  const first = queue.run(command)
  assert.deepEqual(await queue.run(command), { type: 'busy' })
  assert.equal(count, 1)
  resolve(view(8))
  assert.equal((await first).type, 'success')
  assert.equal(queue.isRunning, false)
})

test('응답 유실 재시도는 같은 식별자와 본문을 유지하고 명령 교체를 막음', async () => {
  const calls = []
  const queue = new PetCommandQueue(async (request) => {
    calls.push(structuredClone(request))
    if (calls.length === 1) throw new ApiError('timeout')
    return { ...view(8), outcome: { action: 'feed', xpAwarded: 10, affinityAwarded: 3 } }
  })
  assert.equal((await queue.run(command)).type, 'uncertain')
  assert.equal(
    (await queue.run({ ...command, body: { ...command.body, action: 'play' } })).type,
    'busy',
  )
  assert.equal(calls.length, 1)
  assert.equal((await queue.run()).data.outcome.xpAwarded, 10)
  assert.deepEqual(calls[1], calls[0])
})

test('서버 장애는 원래 명령을 보존하고 확정 충돌은 새 수정 번호와 식별자를 허용함', async () => {
  const calls = []
  const queue = new PetCommandQueue(async (request) => {
    calls.push(request)
    if (calls.length === 1) throw new ApiError('upstream error', 503)
    if (calls.length === 2) throw new ApiError('REVISION_CONFLICT', 409)
    return view(12)
  })
  assert.equal((await queue.run(command)).type, 'uncertain')
  assert.equal((await queue.run()).type, 'rejected')
  const fresh = {
    kind: 'actions',
    body: { action: 'feed', expectedRevision: 11, idempotencyKey: 'new-request-key' },
  }
  assert.equal((await queue.run(fresh)).type, 'success')
  assert.equal(calls[2], fresh)
})

const { test, assert, ApiError, PetCommandQueue, commands } = require('./fixtures/core.fixture.cjs')

test('불확실한 간식 완료는 명시적 재시도에서 동일한 입력과 식별자만 재사용함', async () => {
  const seen = []
  const queue = new PetCommandQueue(async (command) => {
    seen.push(structuredClone(command))
    if (seen.length === 1) throw new ApiError('network disconnected')
    return { pet: { revision: 9 }, gameOutcome: { kind: 'finish', score: 8, starsDelta: 12 } }
  })
  const finish = structuredClone(commands[5])
  assert.equal((await queue.run(finish)).type, 'uncertain')
  assert.equal((await queue.run(commands[2])).type, 'busy')
  assert.equal(seen.length, 1)
  assert.equal((await queue.run()).data.gameOutcome.starsDelta, 12)
  assert.deepEqual(seen[0], seen[1])
})

test('명령 큐 정리는 진행 요청과 새 쓰기를 차단하고 엄격 모드 재활성화를 지원함', async () => {
  let signal,
    done,
    sends = 0
  const queue = new PetCommandQueue(async (_command, requestSignal) => {
    signal = requestSignal
    sends++
    return new Promise((resolve) => (done = resolve))
  })
  const pending = queue.run(commands[0])
  queue.dispose()
  assert.equal(signal.aborted, true)
  assert.equal((await queue.run(commands[1])).type, 'busy')
  done({ pet: { revision: 8 } })
  await pending
  assert.equal(sends, 1)
  queue.activate()
  const next = queue.run(commands[1])
  assert.equal(signal.aborted, false)
  done({ pet: { revision: 9 } })
  await next
})

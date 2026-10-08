const {
  test,
  assert,
  ApiError,
  PetCommandQueue,
  snack,
  sessionId,
} = require('./fixtures/core.fixture.cjs')
const { snackUiHarness } = require('./fixtures/snack.fixture.cjs')

test('완료 재시도 거절은 최신 수정 번호로 다시 열고 입력을 자동 재생하지 않음', async () => {
  const h = snackUiHarness(),
    requests = []
  let finishes = 0
  try {
    const queue = new PetCommandQueue(async (command) => {
      requests.push(structuredClone(command))
      if (command.kind === 'games/start') {
        h.activate()
        return {
          game: h.props.game,
          serverTime: h.props.serverTime,
          gameOutcome: { kind: 'start' },
        }
      }
      if (++finishes === 1) throw new ApiError('response lost')
      if (finishes === 2) throw new ApiError('REVISION_CONFLICT', 409)
      h.props.game = { ...h.props.game, games: { ...h.props.game.games, active: null } }
      return {
        game: h.props.game,
        gameOutcome: { kind: 'finish', sessionId, game: 'snack', score: 8, starsDelta: 12 },
      }
    })
    h.props.onCommand = (command) => queue.run(command)
    h.render()
      .find((n) => n.type === 'button' && n.props.children === '간식 받기 시작')
      .props.onClick()
    await new Promise(setImmediate)
    h.render()
    h.tick(30000)
    const finish = h
      .render()
      .find((n) => n.type === 'button' && n.props.children === '결과 저장하고 별사탕 확인')
    finish.props.onClick()
    finish.props.onClick()
    await new Promise(setImmediate)
    assert.equal(finishes, 1)
    h.props.disabled = true
    assert.equal(
      h.render().find((n) => n.props.children === '결과 저장하고 별사탕 확인').props.disabled,
      true,
    )
    assert.equal((await h.props.onCommand()).type, 'rejected')
    assert.deepEqual(requests[1], requests[2])
    h.props.disabled = false
    h.props.revision = 9
    const fresh = h.render().find((n) => n.props.children === '결과 저장하고 별사탕 확인')
    assert.equal(fresh.props.disabled, false)
    assert.equal(finishes, 2)
    fresh.props.onClick()
    await new Promise(setImmediate)
    assert.equal(finishes, 3)
    assert.equal(requests[3].body.expectedRevision, 9)
    assert.notEqual(requests[3].body.idempotencyKey, requests[1].body.idempotencyKey)
    assert.deepEqual(requests[3].body.inputs, requests[1].body.inputs)
    h.render()
    assert.equal(h.timers.size, 0)
  } finally {
    h.dispose()
  }
})

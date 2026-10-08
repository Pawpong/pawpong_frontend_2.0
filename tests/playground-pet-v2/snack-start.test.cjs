const { test, assert, snack } = require('./fixtures/core.fixture.cjs')
const { snackUiHarness } = require('./fixtures/snack.fixture.cjs')

test('간식 시작은 준비 완료를 기다리고 중복 클릭과 실패 및 숨겨진 화면의 전송을 차단함', async () => {
  const h = snackUiHarness(),
    requests = []
  let prepared,
    preparations = 0
  h.props.onPrepareGame = (kind) => {
    assert.equal(kind, 'snack')
    preparations++
    return new Promise((resolve) => {
      prepared = resolve
    })
  }
  h.props.onCommand = async (command) => {
    requests.push(command)
    return { type: 'busy' }
  }
  const startButton = () => h.render().find((n) => n.props.children === '간식 받기 시작')
  try {
    const first = startButton()
    first.props.onClick()
    first.props.onClick()
    assert.equal(preparations, 1)
    assert.equal(requests.length, 0)
    assert.equal(startButton().props.disabled, true)
    prepared(false)
    await new Promise(setImmediate)
    assert.equal(requests.length, 0)
    startButton().props.onClick()
    prepared(true)
    await new Promise(setImmediate)
    assert.equal(requests.length, 1)
    assert.equal(requests[0].kind, 'games/start')
    assert.equal(requests[0].body.game, 'snack')
    startButton().props.onClick()
    h.visibility(true)
    h.visibility(false)
    prepared(true)
    await new Promise(setImmediate)
    assert.equal(requests.length, 1)
  } finally {
    h.dispose()
  }
})

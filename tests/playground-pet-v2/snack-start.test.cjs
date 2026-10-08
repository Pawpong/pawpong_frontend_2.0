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
    h.props.characterReady = false
    const moves = []
    h.props.gameSurface = {
      closest: () => ({
        scrollIntoView: (options) => moves.push(options),
        focus: (options) => moves.push(options),
      }),
    }
    h.render()
      .find((n) => n.props.children === '방 화면으로 이동')
      .props.onClick()
    assert.deepEqual(moves, [{ block: 'start' }, { preventScroll: true }])
    h.props.characterReady = true
    assert.ok(
      h
        .render()
        .some(
          (n) =>
            n.props.children ===
            '그림을 다시 준비했어요. 시작 버튼을 눌러 새 게임을 시작해 주세요.',
        ),
    )
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

test('게임 그림 준비 예외도 안내로 복구하고 서버의 게임 시작을 보내지 않음', async () => {
  const h = snackUiHarness()
  let commands = 0
  h.props.onPrepareGame = async () => {
    throw new Error('합성 준비 오류')
  }
  h.props.onCommand = async () => {
    commands++
    return { type: 'busy' }
  }
  try {
    h.render()
      .find((n) => n.props.children === '간식 받기 시작')
      .props.onClick()
    await new Promise(setImmediate)
    h.props.characterReady = false
    assert.ok(h.render().some((n) => n.props.children === '방 화면으로 이동'))
    assert.equal(commands, 0)
  } finally {
    h.dispose()
  }
})

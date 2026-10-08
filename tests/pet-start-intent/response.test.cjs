const { test } = require('node:test')
const assert = require('node:assert/strict')
const { snackUiHarness } = require('../playground-pet-v2/fixtures/snack.fixture.cjs')
const flush = () => new Promise(setImmediate)

test('서버 전송 후 자기 게임 수신과 바쁜 상태는 정상 시작 응답을 폐기하지 않음', async () => {
  const h = snackUiHarness()
  let respond
  h.props.onCommand = () =>
    new Promise((resolve) => {
      respond = resolve
    })
  try {
    h.render()
      .find((node) => node.props.children === '간식 받기 시작')
      .props.onClick()
    await flush()
    assert.ok(h.render().some((node) => node.props.children === '게임 시작을 확인하고 있어요…'))
    assert.equal(
      h.render().some((node) => node.props.children === '준비 취소'),
      false,
    )
    h.props.disabled = true
    h.props.revision++
    h.activate()
    h.render()
    respond({
      type: 'success',
      data: {
        serverTime: h.props.serverTime,
        game: h.props.game,
        gameOutcome: { kind: 'start', game: 'snack', sessionId: h.session.sessionId },
      },
    })
    await flush()
    h.props.disabled = false
    h.render()
    assert.equal(h.snapshots.at(-1).session.sessionId, h.session.sessionId)
  } finally {
    h.dispose()
  }
})

test('그림 준비 자체의 화면 준비 상태 변경은 정상 시작을 취소하지 않음', async () => {
  const h = snackUiHarness(),
    commands = []
  let ready
  h.props.onPrepareGame = () =>
    new Promise((resolve) => {
      ready = resolve
    })
  h.props.onCommand = async (command) => {
    commands.push(command)
    return { type: 'busy' }
  }
  try {
    h.render()
      .find((node) => node.props.children === '간식 받기 시작')
      .props.onClick()
    h.props.characterReady = false
    h.render()
    ready(true)
    await flush()
    assert.equal(commands.length, 1)
  } finally {
    h.dispose()
  }
})

test('메뉴를 떠났다 돌아온 이전 준비는 재생하지 않고 새 클릭만 시작함', async () => {
  const h = snackUiHarness(),
    commands = [],
    preparations = []
  h.props.onPrepareGame = () => new Promise((resolve) => preparations.push(resolve))
  h.props.onCommand = async (command) => {
    commands.push(command)
    return { type: 'busy' }
  }
  const start = () =>
    h
      .render()
      .find((node) => node.props.children === '간식 받기 시작')
      .props.onClick()
  try {
    start()
    h.props.selected = false
    h.render()
    h.props.selected = true
    h.render()
    preparations[0](true)
    await flush()
    assert.equal(commands.length, 0)
    start()
    preparations[1](true)
    await flush()
    assert.equal(commands.length, 1)
  } finally {
    h.dispose()
  }
})

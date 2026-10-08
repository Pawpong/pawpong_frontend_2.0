const { test } = require('node:test')
const assert = require('node:assert/strict')
const { snackUiHarness } = require('../playground-pet-v2/fixtures/snack.fixture.cjs')
const flush = () => new Promise(setImmediate)

for (const [label, change] of [
  [
    '다른 메뉴로 이동',
    (h) => {
      h.props.selected = false
    },
  ],
  [
    '다른 작업 시작',
    (h) => {
      h.props.disabled = true
    },
  ],
  ['다른 게임 수신', (h) => h.activate()],
  [
    '상태 버전 변경',
    (h) => {
      h.props.revision++
    },
  ],
  ['화면 이탈', (h) => h.unmount()],
]) {
  test(`준비 중 ${label} 뒤에는 서버의 게임을 시작하지 않음`, async () => {
    const h = snackUiHarness()
    let ready
    const commands = []
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
      change(h)
      if (label !== '화면 이탈') h.render()
      ready(true)
      await flush()
      assert.deepEqual(commands, [])
    } finally {
      h.dispose()
    }
  })
}

test('준비 취소 후 새 시도의 성공은 유지하고 이전 실패는 안내를 덮지 않음', async () => {
  const h = snackUiHarness(),
    prepared = [],
    commands = []
  let cancellations = 0
  h.props.onCancelPreparation = () => cancellations++
  h.props.onPrepareGame = () => new Promise((resolve) => prepared.push(resolve))
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
    h.render()
      .find((node) => node.props.children === '준비 취소')
      .props.onClick()
    assert.equal(cancellations, 1)
    assert.ok(
      h
        .render()
        .some(
          (node) => node.props.children === '게임 준비를 멈췄어요. 원할 때 다시 시작해 주세요.',
        ),
    )
    start()
    prepared[0](false)
    await flush()
    assert.ok(h.render().some((node) => node.props.children === '준비 취소'))
    assert.equal(
      h.render().some((node) => node.props.children === '방 화면으로 이동'),
      false,
    )
    prepared[1](true)
    await flush()
    assert.equal(commands.length, 1)
    assert.equal(commands[0].body.expectedRevision, 7)
  } finally {
    h.dispose()
  }
})

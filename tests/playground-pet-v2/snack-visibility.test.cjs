const { test, assert } = require('./fixtures/core.fixture.cjs')
const { snackUiHarness } = require('./fixtures/snack.fixture.cjs')

test('게임 시작 중 화면 숨김은 늦은 응답을 처리하고 타이머와 이벤트를 정리함', async () => {
  for (const publishEarly of [true, false]) {
    const h = snackUiHarness()
    try {
      let complete
      h.props.onCommand = () => {
        if (publishEarly) h.activate()
        return new Promise(
          (resolve) =>
            (complete = () => {
              h.activate()
              resolve({
                type: 'success',
                data: {
                  game: h.props.game,
                  serverTime: h.props.serverTime,
                  gameOutcome: { kind: 'start' },
                },
              })
            }),
        )
      }
      h.render()
        .find((n) => n.props.children === '간식 받기 시작')
        .props.onClick()
      await new Promise(setImmediate)
      h.render()
      h.visibility(true)
      h.visibility(false)
      complete()
      await new Promise(setImmediate)
      const nodes = h.render()
      assert.ok(
        nodes.some(
          (n) =>
            n.props?.role === 'alert' &&
            String(n.props.children).includes('화면이 숨겨져 게임을 멈췄어요.'),
        ),
      )
      assert.equal(
        nodes.some((n) => n.props?.className === 'snackReadout'),
        false,
      )
      assert.equal(h.timers.size, 0)
      assert.equal(h.snapshots.at(-1), null)
    } finally {
      h.dispose()
      assert.equal(
        [...h.listeners.values()].reduce((sum, set) => sum + set.size, 0),
        0,
      )
    }
  }
})

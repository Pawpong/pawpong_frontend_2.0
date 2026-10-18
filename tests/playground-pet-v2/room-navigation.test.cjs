const { test, assert, room, sessionId } = require('./fixtures/core.fixture.cjs')
const { roomUiHarness } = require('./fixtures/room.fixture.cjs')

test('돌봄 전용 응답은 돌봄과 기록을 유지하고 이용 불가 탭을 건너뜀', () => {
  const ui = roomUiHarness()
  let nodes = ui.render()
  assert.deepEqual(
    nodes.filter((n) => n.props?.role === 'tab').map((n) => n.props.children),
    ['내 방', '기록'],
  )
  assert.equal(ui.characterEnabled(), false)
  assert.equal(
    nodes.some((n) => n.type === ui.Stage),
    false,
  )
  let focused = -1,
    prevented = false
  nodes
    .find((n) => n.props?.role === 'tablist')
    .props.onKeyDown({
      key: 'ArrowRight',
      preventDefault() {
        prevented = true
      },
      currentTarget: {
        querySelectorAll: () => [0, 1].map((index) => ({ focus: () => (focused = index) })),
      },
    })
  nodes = ui.render()
  assert.equal(nodes.find((n) => n.props?.['aria-selected']).props.children, '기록')
  assert.equal(focused, 1)
  assert.equal(prevented, true)
})

test('복원된 게임은 결과 탭을 유지하고 실제 엔진 준비 뒤 시작함', () => {
  const ui = roomUiHarness()
  const game = {
    wallet: { stars: 50 },
    room: {},
    catalog: [],
    achievements: [],
    games: { active: { sessionId, game: 'memory' } },
  }
  let nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.props?.id === 'pet-panel-games').props.hidden, false)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
  nodes.find((n) => n.type === ui.Stage).props.onReady(true)
  nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, true)
  const result = { kind: 'finish', sessionId, score: 100, starsDelta: 14 }
  nodes = ui.render({ ...ui.view, game: { ...game, games: { active: null } } }, result)
  assert.equal(nodes.find((n) => n.props?.id === 'pet-panel-games').props.hidden, false)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.gameOutcome, result)
  nodes.find((n) => n.type === ui.Stage).props.onReady(false)
  nodes = ui.render({ ...ui.view, game })
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
})

test('기존 초상화로 게임을 열지 않고 명시적 연결 전후 돌봄을 유지함', () => {
  const ui = roomUiHarness()
  const view = {
    ...ui.view,
    pet: { ...ui.view.pet, character: { format: 'legacy-portrait', sourceJobId: 'original' } },
    game: {
      wallet: { stars: 50 },
      room: {},
      catalog: [],
      achievements: [],
      games: { active: null },
    },
  }
  let nodes = ui.render(view)
  assert.equal(ui.characterEnabled(), false)
  assert.equal(nodes.find((n) => n.type === ui.Stage).props.snapshot.characterUrl, null)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
  assert.ok(nodes.some((n) => n.props?.connectRevision === 7))
  assert.ok(nodes.some((n) => n.props?.['aria-label']?.startsWith('인사하기')))
  nodes.find((n) => n.type === ui.Stage).props.onReady(true)
  nodes = ui.render(view)
  assert.equal(nodes.find((n) => n.type === ui.Games).props.characterReady, false)
})

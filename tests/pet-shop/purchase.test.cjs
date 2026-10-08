const { test } = require('node:test')
const assert = require('node:assert/strict')
const { ui, button, gameFixture } = require('./fixtures/shop.fixture.cjs')

test('화면을 그리거나 필터와 소품을 고르는 것만으로 구매를 호출하지 않음', () => {
  const h = ui()
  const tree = h.render()
  tree
    .find((node) => node.type === h.components.PetCatalogFilters)
    .props.onChange({ collection: 'forest' })
  const item = h
    .render()
    .find((node) => node.type === 'button' && node.props.className === 'itemButton')
  item.props.onClick()
  h.render()
  assert.equal(h.props.selected.id, 'toy_bone')
  assert.equal(h.props.game.wallet.stars, 20)
  h.unmount()
})

test('구매 확인의 중복 클릭은 한 번 호출하고 성공 후 방을 자동 장착하지 않음', async () => {
  const h = ui(),
    requests = []
  h.props.selected = h.props.game.catalog.find((item) => item.id === 'toy_bone')
  let complete
  h.props.onCommand = (command) => {
    requests.push(command)
    return new Promise((resolve) => {
      complete = resolve
    })
  }
  const confirm = h.render().find((node) => node.type === h.components.PetPurchaseDialog)
    .props.onConfirm
  confirm()
  confirm()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].kind, 'items/purchase')
  assert.equal(requests[0].body.expectedRevision, 7)
  complete({ type: 'success', data: {} })
  await new Promise(setImmediate)
  assert.equal(h.props.selected.id, 'toy_bone')
  assert.equal(h.props.game.room.toy, 'toy_ball')
  assert.equal(requests.length, 1)
  h.props.game.inventory.push('toy_bone')
  h.props.revision = 8
  button(h.render(), '내 방에 적용').props.onClick()
  assert.equal(requests[1].kind, 'room')
  assert.equal(requests[1].body.expectedRevision, 8)
  assert.notEqual(requests[1].body.idempotencyKey, requests[0].body.idempotencyKey)
  complete({ type: 'success', data: {} })
  await new Promise(setImmediate)
  assert.equal(h.props.selected, null)
  h.unmount()
})

test('보유 및 잔액 부족과 성장 잠금 또는 비활성 상태는 구매하지 않음', () => {
  for (const id of ['toy_ball', 'bed_moon']) {
    const h = ui()
    h.props.selected = h.props.game.catalog.find((item) => item.id === id)
    h.render()
      .find((node) => node.type === h.components.PetPurchaseDialog)
      .props.onConfirm()
    h.unmount()
  }
  for (const patch of [{ disabled: true }, { game: { ...gameFixture(), wallet: { stars: 0 } } }]) {
    const h = ui()
    Object.assign(h.props, patch)
    h.props.selected = h.props.game.catalog.find((item) => item.id === 'toy_bone')
    h.render()
      .find((node) => node.type === h.components.PetPurchaseDialog)
      .props.onConfirm()
    h.unmount()
  }
})

test('탭을 떠난 뒤 늦은 장착 응답은 새 화면의 선택을 지우지 않음', async () => {
  const h = ui('inventory')
  h.props.game.room.toy = null
  h.props.selected = h.props.game.catalog.find((item) => item.id === 'toy_ball')
  let complete
  h.props.onCommand = () =>
    new Promise((resolve) => {
      complete = resolve
    })
  button(h.render(), '내 방에 적용').props.onClick()
  h.unmount()
  h.props.selected = h.props.game.catalog.find((item) => item.id === 'bed_moon')
  complete({ type: 'success', data: {} })
  await new Promise(setImmediate)
  assert.equal(h.props.selected.id, 'bed_moon')
})

for (const [outcome, label] of [
  ['success', '성공한'],
  ['uncertain', '결과가 불확실한'],
]) {
  test(`${label} 구매 이후 실제 보유가 확인되어야 적용 안내를 보여 줌`, async () => {
    const h = ui()
    h.props.selected = h.props.game.catalog.find((item) => item.id === 'toy_bone')
    h.props.onCommand = async () => ({ type: outcome, data: {}, error: { status: 503 } })
    h.render()
      .find((node) => node.type === h.components.PetPurchaseDialog)
      .props.onConfirm()
    await new Promise(setImmediate)
    const completed = (tree) => tree.some((node) => node.props.className === 'purchaseStatus')
    assert.equal(completed(h.render()), false)
    h.props.game.inventory.push('toy_bone')
    assert.equal(completed(h.render()), true)
    assert.equal(h.props.game.room.toy, 'toy_ball')
    button(h.render(), '미리보기 닫기').props.onClick()
    assert.equal(completed(h.render()), false)
    h.unmount()
  })
}

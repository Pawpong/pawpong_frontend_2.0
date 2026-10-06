const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const {
  room,
  shop,
  constants,
  gameFixture,
  hooks,
  decorations,
  nodes,
} = require('./fixtures/pet-shop.fixture.cjs')
const filters = (patch = {}) => ({ ...constants.PET_CATALOG_DEFAULT_FILTERS, ...patch })

test('꾸미기 목록에는 소유 소품만 보이고 상점에는 모든 소품을 표시함', () => {
  const game = gameFixture()
  assert.equal(shop.filterPetCatalog(game, 1, 'inventory', filters()).length, 6)
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters()).length, 10)
  assert.deepEqual(
    shop.filterPetCatalog(game, 1, 'shop', filters({ status: 'available' })).map((item) => item.id),
    ['toy_bone', 'plant_flower'],
  )
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters({ status: 'locked' })).length, 2)
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters({ status: 'missing' })).length, 4)
})

test('가구 종류와 테마 및 검색과 보유 상태를 함께 적용함', () => {
  const game = gameFixture()
  const result = shop.filterPetCatalog(
    game,
    1,
    'shop',
    filters({ collection: 'forest', slot: 'toy', query: '  뼈다귀  ', status: 'available' }),
  )
  assert.deepEqual(
    result.map((item) => item.id),
    ['toy_bone'],
  )
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters({ query: '숲속 방' })).length, 2)
  assert.equal(
    shop.filterPetCatalog(game, 1, 'inventory', filters({ status: 'equipped' })).length,
    6,
  )
  assert.equal(
    shop.filterPetCatalog(game, 1, 'shop', filters({ collection: 'forest', slot: 'bed' })).length,
    0,
  )
})

test('추천과 가격 정렬은 서버 카탈로그와 잔액 및 저장된 방을 바꾸지 않음', () => {
  const game = gameFixture(),
    original = structuredClone(game)
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters())[0].id, 'toy_bone')
  assert.equal(
    shop.filterPetCatalog(game, 1, 'shop', filters({ sort: 'price-desc' }))[0].id,
    'bed_moon',
  )
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters({ sort: 'price-asc' }))[0].price, 0)
  const bed = game.catalog.find((item) => item.id === 'bed_moon')
  assert.equal(room.previewPetRoom(game.room, bed).bed, 'bed_moon')
  assert.deepEqual(game, original)
})

test('수집 진행률은 중복 및 오래된 인벤토리 키를 제외하고 남은 가격을 계산함', () => {
  const game = gameFixture()
  game.inventory.push('toy_ball', 'removed_item', 'toy_bone')
  const progress = shop.petCollectionProgress(game)
  assert.deepEqual(
    progress.find((entry) => entry.id === 'cozy'),
    { id: 'cozy', label: '포근한 방', total: 6, owned: 6, remainingPrice: 0 },
  )
  assert.deepEqual(
    progress.find((entry) => entry.id === 'forest'),
    { id: 'forest', label: '숲속 방', total: 2, owned: 1, remainingPrice: 12 },
  )
})

test('잔액과 성장 단계가 달라지면 구매 가능 필터도 즉시 달라짐', () => {
  const game = gameFixture()
  game.wallet.stars = 7
  assert.equal(shop.filterPetCatalog(game, 1, 'shop', filters({ status: 'available' })).length, 0)
  game.wallet.stars = 100
  assert.equal(shop.filterPetCatalog(game, 4, 'shop', filters({ status: 'available' })).length, 4)
  game.inventory.push('bed_moon')
  assert.equal(shop.filterPetCatalog(game, 4, 'shop', filters({ status: 'available' })).length, 3)
})

function ui(mode = 'shop') {
  const runtime = hooks(),
    components = decorations(runtime.react)
  const props = {
    mode,
    game: gameFixture(),
    level: 1,
    revision: 7,
    disabled: false,
    manifest: null,
    selected: null,
    onOpenShop() {},
    onSelect(item) {
      props.selected = item
    },
    onCommand() {
      throw new Error('명시적인 클릭 없이 호출하면 안 됨')
    },
  }
  return {
    props,
    components,
    unmount: runtime.unmount,
    render: () => nodes(runtime.render(() => components.PetDecorations(props))),
  }
}
const button = (tree, label) =>
  tree.find((node) => node.type === 'button' && node.props.children === label)

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

test('상점과 꾸미기는 별도 제목과 입력 이름을 가지며 꾸미기에는 구매 창이 없음', () => {
  const { PetDecorations } = decorations()
  const props = {
    game: gameFixture(),
    level: 1,
    revision: 7,
    disabled: false,
    manifest: null,
    selected: null,
    onSelect() {},
    onCommand() {
      throw new Error('렌더링 중 변경 금지')
    },
  }
  const inventory = renderToStaticMarkup(
    React.createElement(PetDecorations, { ...props, mode: 'inventory' }),
  )
  const storefront = renderToStaticMarkup(
    React.createElement(PetDecorations, { ...props, mode: 'shop' }),
  )
  assert.ok(inventory.includes('방 꾸미기'))
  assert.ok(inventory.includes('pet-inventory-search'))
  assert.equal(inventory.includes('<dialog'), false)
  assert.ok(storefront.includes('별사탕 상점'))
  assert.ok(storefront.includes('pet-shop-search'))
  assert.ok(storefront.includes('지금 구매 가능'))
  assert.ok(storefront.includes('돈으로 살 수 없어요'))
})

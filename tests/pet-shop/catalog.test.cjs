const { test } = require('node:test')
const assert = require('node:assert/strict')
const { room, shop, constants, gameFixture } = require('./fixtures/shop.fixture.cjs')
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

const fs = require('node:fs')
const { test, assert } = require('./fixtures/core.fixture.cjs')
const { shop, gameFixture } = require('../pet-shop/fixtures/shop.fixture.cjs')

test('레벨이 오르면 그 사이에 열린 미보유 소품만 가격 순으로 고름', () => {
  const game = gameFixture()
  const levels = [...new Set(game.catalog.map((item) => item.minLevel))].sort((a, b) => a - b)
  const top = levels.at(-1)
  const unlocked = shop.newlyAvailablePetItems(game, top - 1, top)
  assert.ok(unlocked.length > 0)
  for (const item of unlocked) {
    assert.equal(item.minLevel, top)
    assert.equal(game.inventory.includes(item.id), false)
  }
  assert.deepEqual(
    unlocked.map((item) => item.price),
    [...unlocked.map((item) => item.price)].sort((a, b) => a - b),
  )
  // 레벨이 그대로거나 이미 다 가진 경우에는 알릴 소품이 없다
  assert.deepEqual(shop.newlyAvailablePetItems(game, top, top), [])
  const owned = { ...game, inventory: game.catalog.map((item) => item.id) }
  assert.deepEqual(shop.newlyAvailablePetItems(owned, 0, top), [])
})

test('레벨업 안내는 실제로 열린 소품 수만 덧붙이고 별도 보상을 만들지 않음', () => {
  const room = fs.readFileSync('src/features/playground-pet/ui/PetRoom.tsx', 'utf8')
  assert.match(room, /newlyAvailablePetItems\(game, growth\.from, growth\.banner\)/)
  assert.match(room, /새 소품 \$\{unlockedItems\.length\}개를 상점에서 고를 수 있어요/)
  assert.match(room, /banner: petLevelUp\(growth, pet\), from: growth\.level/)
})

const { test, assert, room } = require('./fixtures/core.fixture.cjs')

test('방 미리보기는 한 슬롯만 바꾸고 소유 목록과 지갑 및 저장된 방을 유지함', () => {
  const item = { id: 'bed_moon', slot: 'bed', minLevel: 4, price: 90 }
  const game = {
    room: {
      wallpaper: 'wallpaper_cream',
      floor: 'floor_oak',
      bed: 'bed_cushion',
      toy: 'toy_ball',
      plant: 'plant_sprout',
      decoration: 'decoration_paw',
    },
    inventory: ['bed_cushion'],
    wallet: { stars: 50 },
  }
  const preview = room.previewPetRoom(game.room, item)
  assert.equal(preview.bed, 'bed_moon')
  assert.equal(game.room.bed, 'bed_cushion')
  assert.equal(game.wallet.stars, 50)
  assert.deepEqual(room.itemAvailability(game, item, 1), {
    owned: false,
    equipped: false,
    locked: true,
    affordable: false,
    purchasable: false,
  })
  assert.equal(room.itemAvailability({ ...game, wallet: { stars: 90 } }, item, 4).purchasable, true)
  assert.equal(
    room.itemAvailability({ ...game, inventory: [...game.inventory, item.id] }, item, 4)
      .purchasable,
    false,
  )
  assert.equal(room.previewPetRoom(game.room, null), game.room)
})

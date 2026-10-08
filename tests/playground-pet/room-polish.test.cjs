const fs = require('node:fs')
const { test, assert, presentation } = require('./fixtures/core.fixture.cjs')
const { shop, gameFixture } = require('../pet-shop/fixtures/shop.fixture.cjs')

const read = (file) => fs.readFileSync(file, 'utf8')

test('상점은 남은 별사탕이 가장 적은 미완성 모음을 실제 가격과 보유 소품으로 알려줌', () => {
  const game = gameFixture()
  const next = shop.nextPetCollection(game)
  const progress = shop.petCollectionProgress(game).filter((row) => row.owned < row.total)
  assert.ok(next)
  assert.equal(next.remainingPrice, Math.min(...progress.map((row) => row.remainingPrice)))
  const complete = { ...game, inventory: game.catalog.map((item) => item.id) }
  assert.equal(shop.nextPetCollection(complete), null)
  const ui = read('src/features/playground-pet/ui/PetDecorations.tsx')
  assert.match(ui, /const nextCollection = mode === 'shop' \? nextPetCollection\(game\) : null/)
  assert.match(ui, /모음까지 \$\{nextCollection\.total - nextCollection\.owned\}개 남았어요/)
})

test('상태 충돌 안내는 다른 기기 사용으로 단정하지 않음', () => {
  const message = presentation.petErrorMessage(409, 'REVISION_CONFLICT')
  assert.match(message, /새로 고쳐졌어요/)
  assert.doesNotMatch(message, /다른 화면/)
})

test('캐릭터를 연결하면 성공을 알리고 방 화면으로 포커스를 옮김', () => {
  assert.match(
    read('src/features/playground-pet/lib/usePetController.ts'),
    /gameOutcome\.kind === 'character'\s*\?\s*'우리 아이 캐릭터를 연결했어요/,
  )
  const room = read('src/features/playground-pet/ui/PetRoom.tsx')
  assert.match(
    room,
    /if \(gameOutcome\?\.kind !== 'character'\) return\s*document\.getElementById\('pet-game-screen'\)\?\.focus/,
  )
})

test('어디서도 쓰지 않는 unlock 이름표는 남기지 않음', () => {
  assert.equal(presentation.PET_UNLOCK_LABELS, undefined)
  assert.doesNotMatch(
    read('src/entities/playground-pet/model/presentation.ts'),
    /PET_UNLOCK_LABELS/,
  )
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { decorations, gameFixture } = require('./fixtures/shop.fixture.cjs')

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

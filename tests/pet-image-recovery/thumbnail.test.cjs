const { test } = require('node:test')
const assert = require('node:assert/strict')
const { assetFixture } = require('./fixtures/image.fixture.cjs')
const { ui } = require('../pet-shop/fixtures/shop.fixture.cjs')
const item = { id: 'toy', name: '합성 장난감', slot: 'toy', assetKey: 'toy' }
const props = (url) => ({ item, manifest: { assets: { toy: { url, width: 32, height: 32 } } } })

test('깨진 소품 썸네일은 항목 이름을 포함한 안내로 바꾸고 중첩 버튼은 만들지 않음', () => {
  const app = assetFixture(),
    input = props('/playground/pet/v2/toy.png')
  app
    .render(input)
    .find((node) => node.type === 'image')
    .props.onError()
  const tree = app.render(input)
  assert.equal(
    tree.some((node) => node.type === 'image' || node.type === 'button'),
    false,
  )
  assert.equal(tree[0].props['aria-label'], '합성 장난감의 그림을 불러오지 못했어요')
})

test('갱신된 소품 주소는 이전 썸네일의 실패 상태를 이어받지 않음', () => {
  const app = assetFixture()
  app
    .render(props('/playground/pet/v2/old.png'))
    .find((node) => node.type === 'image')
    .props.onError()
  assert.equal(
    app.render(props('/playground/pet/v2/new.png'))[0].props.src,
    '/playground/pet/v2/new.png',
  )
})

test('소품 그림이 없거나 외부 주소라면 이미지 요청 없이 준비 안내를 유지함', () => {
  const app = assetFixture()
  for (const input of [{ item, manifest: null }, props('https://foreign.invalid/a.png')]) {
    const tree = app.render(input)
    assert.equal(
      tree.some((node) => node.type === 'image'),
      false,
    )
    assert.ok(tree.some((node) => node.props.children === '그림 준비 중'))
  }
})

test('소품 그림 재시도는 필터와 선택 및 별사탕을 유지하고 구매를 호출하지 않음', () => {
  const app = ui()
  let reads = 0
  app.props.onReloadImages = () => reads++
  app.props.selected = app.props.game.catalog[6]
  const before = app.render()
  const thumbnail = (tree) => tree.find((node) => node.type === app.components.PetAssetThumbnail)
  const retry = before.find((node) => node.props.children === '소품 그림 다시 보기')
  assert.equal(retry.props.type, 'button')
  retry.props.onClick()
  const after = app.render()
  assert.notEqual(thumbnail(before).key, thumbnail(after).key)
  assert.equal(app.props.selected.id, 'toy_bone')
  assert.equal(app.props.game.wallet.stars, 20)
  assert.equal(reads, 1)
})

test('소품 그림을 읽는 동안 재시도 버튼은 비활성화함', () => {
  const app = ui()
  app.props.loadingImages = true
  const retry = app.render().find((node) => node.props.children === '소품 그림 확인 중…')
  assert.equal(retry.props.disabled, true)
})

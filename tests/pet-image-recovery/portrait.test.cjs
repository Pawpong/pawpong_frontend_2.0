const { test } = require('node:test')
const assert = require('node:assert/strict')
const { portraitFixture } = require('./fixtures/image.fixture.cjs')
const image = (tree) => tree.find((node) => node.type === 'image')

test('초상화 읽기 실패 후 주소가 바뀌면 새 그림을 즉시 시도함', () => {
  const app = portraitFixture()
  image(app.render({ src: '/old.png' })).props.onError()
  assert.equal(image(app.render({ src: '/old.png' })), undefined)
  assert.equal(image(app.render({ src: '/new.png' })).props.src, '/new.png')
})

test('이전 그림의 늦은 오류는 새 그림을 실패 상태로 바꾸지 않음', () => {
  const app = portraitFixture()
  const previous = image(app.render({ src: '/old.png' })).props.onError
  assert.ok(image(app.render({ src: '/new.png' })))
  previous()
  assert.ok(image(app.render({ src: '/new.png' })))
})

test('일반 초상화는 명시적으로 재시도하고 원래 주소를 변경하지 않음', () => {
  const app = portraitFixture()
  const src = '/synthetic.png?version=kept'
  image(app.render({ src })).props.onError()
  const button = app.render({ src }).find((node) => node.type === 'button')
  assert.equal(button.props.type, 'button')
  button.props.onClick()
  assert.equal(image(app.render({ src })).props.src, src)
})

test('선택 카드 안의 작은 그림은 중첩 버튼을 만들지 않음', () => {
  const app = portraitFixture()
  image(app.render({ src: '/small.png', compact: true })).props.onError()
  assert.equal(
    app.render({ src: '/small.png', compact: true }).some((node) => node.type === 'button'),
    false,
  )
})

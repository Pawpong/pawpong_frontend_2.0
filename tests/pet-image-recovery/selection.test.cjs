const { test } = require('node:test')
const assert = require('node:assert/strict')
const { selectionFixture } = require('../playground-return-flow/fixtures/selection.fixture.cjs')
const retry = (tree) => tree.find((node) => node.props.children === '그림 다시 불러오기')
const radios = (tree) => tree.filter((node) => node.type === 'input' && node.props.type === 'radio')

test('그림 재조회가 실패해도 선택 목록과 기존 선택을 유지함', () => {
  const app = selectionFixture('first')
  app.query.isError = true
  const tree = app.render()
  assert.equal(radios(tree).length, 1)
  assert.equal(radios(tree)[0].props.checked, true)
  assert.ok(tree.some((node) => node.type === 'form'))
  assert.ok(retry(tree))
  assert.deepEqual(app.calls.commands, [])
})

test('그림 재시도는 목록만 다시 읽고 입력과 선택 및 원래 주소를 유지함', async () => {
  const app = selectionFixture('first')
  app.props.connectRevision = undefined
  const original = app.render()
  original
    .find((node) => node.props.id === 'pet-name')
    .props.onChange({ target: { value: '도토리' } })
  let calls = 0,
    release
  app.query.refetch = () => {
    calls++
    return new Promise((resolve) => {
      release = resolve
    })
  }
  const reload = retry(app.render())
  assert.equal(reload.props.type, 'button')
  reload.props.onClick()
  reload.props.onClick()
  assert.equal(calls, 1)
  release({ isError: false })
  await new Promise(setImmediate)
  const after = app.render()
  assert.equal(after.find((node) => node.props.id === 'pet-name').props.value, '도토리')
  assert.equal(radios(after)[0].props.checked, true)
  const beforeImage = original.find((node) => node.props.src === '/first.png')
  const afterImage = after.find((node) => node.props.src === '/first.png')
  assert.notEqual(afterImage.key, beforeImage.key)
  assert.equal(afterImage.props.src, '/first.png')
  assert.deepEqual(app.calls.commands, [])
})

test('목록이 없는 최초 오류에는 빈 캐릭터 안내 대신 읽기 재시도를 제공함', () => {
  const app = selectionFixture()
  app.query.data = undefined
  app.query.isError = true
  const tree = app.render()
  assert.equal(radios(tree).length, 0)
  assert.ok(tree.some((node) => node.props.children === '다시 불러오기'))
  assert.deepEqual(app.calls.commands, [])
})

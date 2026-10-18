const { test } = require('node:test')
const assert = require('node:assert/strict')
const { PetStartIntent } = require('./fixtures/intent.fixture.cjs')
const context = { selected: true, disabled: false, revision: 7, activeId: '' }
const setup = () => {
  const guard = new PetStartIntent()
  guard.activate()
  guard.update(context)
  return guard
}

for (const [label, change] of [
  ['메뉴 이탈', { selected: false }],
  ['다른 작업', { disabled: true }],
  ['새 상태', { revision: 8 }],
  ['다른 게임', { activeId: 'other' }],
]) {
  test(`${label} 뒤 원래 상태로 돌아와도 이전 준비를 전송하지 않음`, () => {
    const guard = setup(),
      old = guard.begin()
    guard.update({ ...context, ...change })
    guard.update(context)
    assert.equal(guard.isCurrent(old), false)
    assert.equal(guard.markSending(old), false)
    const current = guard.begin()
    guard.finish(old)
    assert.equal(guard.isCurrent(current), true)
    assert.equal(guard.markSending(current), true)
  })
}

test('실제 전송 뒤 상태 갱신은 자기 응답의 처리와 중복 잠금을 유지함', () => {
  const guard = setup(),
    current = guard.begin(),
    changes = []
  const unsubscribe = guard.subscribe(() => changes.push(guard.snapshot()))
  assert.equal(guard.markSending(current), true)
  guard.update({ ...context, disabled: true, revision: 8, activeId: 'own-response' })
  guard.cancelPreparation()
  assert.equal(guard.isCurrent(current), true)
  assert.equal(guard.begin(), null)
  guard.finish(current)
  assert.deepEqual(changes, ['sending', null])
  unsubscribe()
})

test('화면 이탈과 재마운트 뒤에도 이전 시도의 성공은 현재 시도가 아님', () => {
  const guard = setup(),
    old = guard.begin()
  guard.markSending(old)
  guard.dispose()
  guard.activate()
  guard.update(context)
  const current = guard.begin()
  assert.equal(guard.isCurrent(old), false)
  guard.finish(old)
  assert.equal(guard.isCurrent(current), true)
})

test('숨긴 메뉴와 비활성 상태 및 기존 게임 중에는 새 준비를 만들지 않음', () => {
  for (const change of [{ selected: false }, { disabled: true }, { activeId: 'current' }]) {
    const guard = setup()
    guard.update({ ...context, ...change })
    assert.equal(guard.begin(), null)
  }
  assert.equal(new PetStartIntent().begin(), null)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { exitGuardFixture } = require('./fixtures/exit-guard.fixture.cjs')
test('저장 후 가드 기록만 걷어내고 라우터가 작성 화면을 복원하기 전에 목적지로 이동함', () => {
  const fixture = exitGuardFixture()
  let calls = 0
  fixture.hook.completeExit(() => calls++)
  fixture.hook.completeExit(() => calls++)
  assert.equal(calls, 0)
  assert.equal(fixture.history.filter((value) => value[0] === 'back').length, 1)
  assert.equal(fixture.pop(), true)
  assert.equal(calls, 1)
  fixture.pop()
  assert.equal(calls, 1)
})
test('브라우저 뒤로가기 취소는 입력 화면을 유지하고 확인은 원래 이전 화면으로 이동함', () => {
  const fixture = exitGuardFixture()
  fixture.pop()
  assert.equal(fixture.state.at(-1), true)
  fixture.hook.cancelExit()
  assert.equal(fixture.state.at(-1), false)
  fixture.pop()
  fixture.hook.confirmExit()
  assert.deepEqual(fixture.history.at(-1), ['go', -2])
})
test('다른 폼이 쓰는 기존 직접 이동 확인 방식은 그대로 유지함', () => {
  const fixture = exitGuardFixture()
  let calls = 0
  assert.equal(fixture.hook.requestExit(), false)
  fixture.hook.confirmExit(() => calls++)
  assert.equal(calls, 1)
  assert.equal(fixture.history.filter((value) => value[0] === 'back').length, 0)
})
test('화면이 사라지면 대기하던 이동 콜백을 실행하지 않음', () => {
  const fixture = exitGuardFixture()
  let calls = 0
  fixture.hook.completeExit(() => calls++)
  fixture.cleanup()
  fixture.pop()
  assert.equal(calls, 0)
})
test('연속 뒤로가기가 다른 화면에 도달하면 완료 콜백으로 이동을 덮어쓰지 않음', () => {
  const fixture = exitGuardFixture()
  let calls = 0
  fixture.hook.completeExit(() => calls++)
  fixture.location.href = 'https://example.invalid/community'
  assert.equal(fixture.pop(), false)
  assert.equal(calls, 0)
})

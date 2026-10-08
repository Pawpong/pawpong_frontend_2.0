const { test } = require('node:test')
const assert = require('node:assert/strict')
const { selectionFixture } = require('./fixtures/selection.fixture.cjs')
const radios = (nodes) =>
  nodes.filter((node) => node.type === 'input' && node.props.type === 'radio')

test('링크의 캐릭터가 다음 페이지에 있으면 읽기만 이어가고 찾은 그림을 먼저 표시함', () => {
  const f = selectionFixture()
  f.render()
  assert.equal(f.calls.reads, 1)
  assert.deepEqual(f.calls.commands, [])
  f.query.data.pages.push({
    images: [{ sourceJobId: 'requested', imageUrl: '/requested.png' }],
    nextCursor: null,
  })
  f.query.isFetching = false
  f.query.hasNextPage = false
  const inputs = radios(f.render())
  assert.equal(inputs[0].props.value, 'requested')
  assert.equal(inputs[0].props.checked, true)
  assert.equal(f.calls.reads, 1)
  assert.deepEqual(f.calls.commands, [])
})

test('탐색 중 다른 캐릭터를 고르면 늦게 발견한 요청 그림이 선택을 덮어쓰지 않음', () => {
  const f = selectionFixture()
  radios(f.render())[0].props.onChange()
  f.query.data.pages.push({
    images: [{ sourceJobId: 'requested', imageUrl: '/requested.png' }],
    nextCursor: 'third',
  })
  f.query.isFetching = false
  const inputs = radios(f.render())
  assert.equal(inputs.find((node) => node.props.value === 'first').props.checked, true)
  assert.equal(inputs.find((node) => node.props.value === 'requested').props.checked, false)
  assert.equal(f.calls.reads, 1)
})

test('그림이 없거나 조회가 실패하면 자동 생성과 연결을 하지 않고 추가 탐색도 멈춤', () => {
  const f = selectionFixture()
  f.query.hasNextPage = false
  const form = f.render().find((node) => node.type === 'form')
  form.props.onSubmit({ preventDefault() {} })
  assert.equal(f.calls.reads, 0)
  assert.deepEqual(f.calls.commands, [])
  f.query.hasNextPage = true
  f.query.isError = true
  f.render()
  assert.equal(f.calls.reads, 0)
})

test('반복되는 페이지 커서는 멈추고 중복 그림을 여러 선택지로 표시하지 않음', () => {
  const f = selectionFixture('first')
  f.query.data.pages.push({
    images: [{ sourceJobId: 'first', imageUrl: '/first.png' }],
    nextCursor: 'next',
  })
  assert.equal(radios(f.render()).length, 1)
  assert.equal(
    f.options().getNextPageParam({ nextCursor: 'next' }, [], 'next', [null, 'next']),
    undefined,
  )
  assert.equal(
    f.options().getNextPageParam({ nextCursor: 'third' }, [], 'next', [null, 'next']),
    'third',
  )
})

test('자동 선택 후에도 연결은 명시적인 제출 한 번으로만 실행함', () => {
  const f = selectionFixture('first')
  const form = f.render().find((node) => node.type === 'form')
  assert.deepEqual(f.calls.commands, [])
  form.props.onSubmit({ preventDefault() {} })
  assert.equal(f.calls.commands.length, 1)
  assert.equal(f.calls.commands[0].body.sourceJobId, 'first')
  assert.equal(f.calls.commands[0].kind, 'character-source')
})

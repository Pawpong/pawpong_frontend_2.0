const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => dependencies[name])
  return output
}

const { findCounterpartReadIndex } = load('src/app/(main)/chat/_lib/readMarker.ts')

/** mine=true 는 내가 보낸 메시지, read 는 상대가 읽었는지 */
const log = (...entries) => entries.map(([mine, read]) => ({ isMine: mine, isRead: Boolean(read) }))

test('아무 메시지도 없으면 표시할 자리가 없다', () => {
  assert.equal(findCounterpartReadIndex([]), -1)
})

test('내 메시지를 아직 읽지 않았으면 표시하지 않는다', () => {
  assert.equal(findCounterpartReadIndex(log([true, false], [true, false])), -1)
})

test('상대가 자기 글만 남겼으면 표시하지 않는다', () => {
  // 상대가 자기 글을 읽은 것은 알려줄 가치가 없고, 내 메시지를 읽었다는 뜻으로 오해된다.
  assert.equal(findCounterpartReadIndex(log([false], [false])), -1)
})

test('읽힌 내 메시지 중 마지막에 표시한다', () => {
  assert.equal(findCounterpartReadIndex(log([true, true], [true, true], [true, false])), 1)
})

test('상대가 답장했으면 표시가 답장까지 내려온다', () => {
  // 답장을 썼다면 그 시점까지는 읽은 것이다. 내 메시지만 보면 표시가 답장 위에 남는다.
  assert.equal(findCounterpartReadIndex(log([true, true], [false])), 1)
})

test('답장 뒤에 보낸 내 메시지가 아직 안 읽혔으면 표시는 답장에 머문다', () => {
  assert.equal(findCounterpartReadIndex(log([true, true], [false], [true, false])), 1)
})

test('전부 읽혔으면 마지막 메시지에 표시한다', () => {
  assert.equal(findCounterpartReadIndex(log([true, true], [false], [true, true])), 2)
})

test('오래된 순 입력을 전제한다', () => {
  // 서버 목록은 최신순이고 useChatRoom 의 mergeChatMessages 가 오래된 순으로 뒤집는다.
  // 날것을 그대로 넘기면 같은 대화에서 다른 자리를 가리킨다.
  const oldestFirst = log([true, true], [false], [true, false])
  const newestFirst = [...oldestFirst].reverse()
  assert.equal(findCounterpartReadIndex(oldestFirst), 1)
  assert.notEqual(findCounterpartReadIndex(newestFirst), 1)
})

test('표시는 대화 전체에서 한 자리뿐이다', () => {
  const messages = log([true, true], [false], [true, true], [true, false])
  const index = findCounterpartReadIndex(messages)
  const marked = messages.filter((_, i) => i === index)
  assert.equal(marked.length, 1)
  assert.equal(index, 2)
})

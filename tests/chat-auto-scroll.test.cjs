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

const { isPinnedToBottom, shouldFollowNewMessage, BOTTOM_PIN_THRESHOLD_PX } = load(
  'src/app/(main)/chat/_lib/autoScroll.ts',
)

/** 스크롤 높이 2000, 보이는 높이 600 인 목록에서 바닥까지 남은 거리로 상태를 만든다 */
const atDistanceFromBottom = (distance) => ({
  scrollHeight: 2000,
  clientHeight: 600,
  scrollTop: 2000 - 600 - distance,
})

test('맨 아래에 있으면 고정으로 본다', () => {
  assert.equal(isPinnedToBottom(atDistanceFromBottom(0)), true)
})

test('한 줄 남짓 올라간 정도는 아직 고정으로 본다', () => {
  assert.equal(isPinnedToBottom(atDistanceFromBottom(BOTTOM_PIN_THRESHOLD_PX)), true)
})

test('그보다 더 올라가면 고정이 풀린다', () => {
  assert.equal(isPinnedToBottom(atDistanceFromBottom(BOTTOM_PIN_THRESHOLD_PX + 1)), false)
})

test('내용이 화면보다 짧으면 항상 고정이다', () => {
  assert.equal(isPinnedToBottom({ scrollHeight: 300, clientHeight: 600, scrollTop: 0 }), true)
})

test('방을 처음 열면 맨 아래로 간다', () => {
  const go = shouldFollowNewMessage({
    firstPaint: true,
    pinnedToBottom: false,
    newestIsMine: false,
  })
  assert.equal(go, true)
})

test('맨 아래를 보고 있으면 상대 메시지를 따라간다', () => {
  const go = shouldFollowNewMessage({
    firstPaint: false,
    pinnedToBottom: true,
    newestIsMine: false,
  })
  assert.equal(go, true)
})

test('지난 대화를 읽는 중이면 상대 메시지가 와도 끌어내리지 않는다', () => {
  const go = shouldFollowNewMessage({
    firstPaint: false,
    pinnedToBottom: false,
    newestIsMine: false,
  })
  assert.equal(go, false)
})

test('지난 대화를 읽는 중이어도 내가 보낸 메시지는 따라간다', () => {
  // 방금 친 말이 화면 밖에 있으면 보낸 것 같지가 않다.
  const go = shouldFollowNewMessage({
    firstPaint: false,
    pinnedToBottom: false,
    newestIsMine: true,
  })
  assert.equal(go, true)
})

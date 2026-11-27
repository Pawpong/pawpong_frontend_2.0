const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(path) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, () => ({}))
  return output
}

const { formatChatListTime } = load('src/app/(main)/chat/_lib/utils.ts')
// 로컬 시각 기준 — 2026년 11월 27일 오후 2시
const now = new Date(2026, 10, 27, 14, 0)
const at = (...parts) => new Date(...parts).toISOString()

test('채팅 목록 날짜는 카카오톡 목록처럼 오늘은 시각, 어제는 어제, 올해는 월일, 그 전 해는 연도까지 쓴다', () => {
  assert.equal(formatChatListTime(at(2026, 10, 27, 9, 5), now), '오전 9:05')
  assert.equal(formatChatListTime(at(2026, 10, 27, 0, 30), now), '오전 12:30')
  assert.equal(formatChatListTime(at(2026, 10, 27, 12, 0), now), '오후 12:00')
  assert.equal(formatChatListTime(at(2026, 10, 27, 13, 40), now), '오후 1:40')
  assert.equal(formatChatListTime(at(2026, 10, 26, 23, 59), now), '어제')
  assert.equal(formatChatListTime(at(2026, 10, 24, 10, 0), now), '11월 24일')
  assert.equal(formatChatListTime(at(2026, 0, 1, 10, 0), now), '1월 1일')
  assert.equal(formatChatListTime(at(2020, 2, 8, 10, 0), now), '2020. 3. 8.')
})

test('새해 첫날의 어제는 지난해 12월 31일이다', () => {
  const newYear = new Date(2027, 0, 1, 9, 0)
  assert.equal(formatChatListTime(at(2026, 11, 31, 22, 0), newYear), '어제')
  assert.equal(formatChatListTime(at(2026, 11, 30, 22, 0), newYear), '2026. 12. 30.')
})

test('날짜가 없거나 읽을 수 없으면 비운다', () => {
  assert.equal(formatChatListTime(undefined, now), '')
  assert.equal(formatChatListTime('not-a-date', now), '')
})

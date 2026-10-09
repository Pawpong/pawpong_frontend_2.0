const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/discovery.fixture.cjs')

const { playQuizReducer, initialPlayQuiz } = loadTypescript(
  'src/features/playground-tools/model/playQuiz.ts',
)
const run = (actions, state = initialPlayQuiz) => actions.reduce(playQuizReducer, state)
const ui = 'src/features/playground-tools/ui'

test('답을 고르면 잠깐 표시한 뒤 다음 질문으로 넘어가고, 넘어가는 중 다시 눌러도 건너뛰지 않음', () => {
  const picked = run([{ type: 'pick', index: 1 }])
  assert.deepEqual(picked.answers, [1])
  assert.equal(picked.picked, 1)
  assert.equal(picked.beat, 1)
  // 튀는 중에 한 번 더 눌러도 답과 단계가 그대로다.
  assert.equal(playQuizReducer(picked, { type: 'pick', index: 0 }), picked)
  const next = playQuizReducer(picked, { type: 'advance', total: 3 })
  assert.equal(next.step, 1)
  assert.equal(next.picked, null)
  // 고르지 않았는데 넘기라는 신호가 와도 움직이지 않는다.
  assert.equal(playQuizReducer(next, { type: 'advance', total: 3 }), next)
})

test('마지막 답 뒤에는 섞기를 거쳐 결과가 되고, 앞으로 돌아가도 고른 답은 남음', () => {
  const answered = run([
    { type: 'pick', index: 0 },
    { type: 'advance', total: 3 },
    { type: 'pick', index: 1 },
    { type: 'advance', total: 3 },
    { type: 'pick', index: 1 },
    { type: 'advance', total: 3 },
  ])
  assert.equal(answered.phase, 'shuffling')
  assert.equal(answered.step, 2)
  const done = playQuizReducer(answered, { type: 'done' })
  assert.equal(done.phase, 'done')
  assert.deepEqual(done.answers, [0, 1, 1])

  const back = playQuizReducer(done, { type: 'go', step: 1, total: 3 })
  assert.equal(back.phase, 'asking')
  assert.equal(back.step, 1)
  assert.deepEqual(back.answers, [0, 1, 1])
  // 고른 답 그대로 결과를 다시 펼칠 수 있다.
  assert.equal(playQuizReducer(back, { type: 'reveal', total: 3 }).phase, 'shuffling')
  // 주소처럼 바깥 값이 와도 질문 범위를 벗어나지 않는다.
  assert.equal(playQuizReducer(back, { type: 'go', step: 99, total: 3 }).step, 2)
  assert.equal(playQuizReducer(back, { type: 'go', step: -4, total: 3 }).step, 0)
})

test('답이 비어 있으면 결과를 펼치지 않고, 처음부터 하면 답만 비움', () => {
  const half = run([
    { type: 'pick', index: 0 },
    { type: 'advance', total: 3 },
  ])
  assert.equal(playQuizReducer(half, { type: 'reveal', total: 3 }), half)
  assert.equal(playQuizReducer(half, { type: 'done' }), half)
  const restarted = playQuizReducer(half, { type: 'restart' })
  assert.deepEqual(restarted.answers, [])
  assert.equal(restarted.step, 0)
  assert.equal(restarted.phase, 'asking')
  // 장면 카드 튀기는 계속 이어진다.
  assert.equal(restarted.beat, half.beat)
})

test('취향 찾기·멍냥BTI는 같은 진행을 쓰고 버튼은 고른 상태를 알리며 타이머를 정리함', () => {
  const quiz = source(`${ui}/PlayQuiz.tsx`)
  for (const file of ['PetTasteDiscovery.tsx', 'PetBtiDiscovery.tsx'])
    assert.match(source(`${ui}/${file}`), /<PlayQuiz\b/, file)
  assert.match(quiz, /aria-pressed=\{answers\[step\] === index\}/)
  assert.match(quiz, /aria-labelledby=\{headingId\}/)
  assert.match(quiz, /useEffect\(\(\) => \(\) => window\.clearTimeout\(timer\.current\), \[\]\)/)
  assert.match(quiz, /return \(\) => window\.clearTimeout\(id\)/)
  assert.match(quiz, /prefersReducedMotion\(\)/)
  // 결과를 만드는 동안 상태로 알린다.
  assert.match(source(`${ui}/PlayShuffle.tsx`), /role="status"/)
  // 모바일은 질문부터 보이고 노트북부터 장면 옆에 놓인다.
  assert.match(quiz, /className="min-w-0 lap:order-2"/)
  assert.match(quiz, /className="space-y-4 lap:order-1"/)
})

test('통통 튀는 연출(고르기·뒤집기·도장·섞기)은 움직임 줄이기에서 모두 멈춤', () => {
  const css = source(`${ui}/Discovery.module.css`)
  const reduced = css.slice(css.lastIndexOf('@media (prefers-reduced-motion: reduce)'))
  for (const selector of [
    '.reveal',
    '.sparkles',
    '.stamp',
    '.choice[data-picked]',
    '.question',
    '.shuffleDeck span',
    '.scene[data-busy] .deckLeft',
  ])
    assert.ok(reduced.includes(selector), selector)
  assert.match(reduced, /\.choice:active,\s*\.nextPlay:active \{\s*translate: none;/)
})

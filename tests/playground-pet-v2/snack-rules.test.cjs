const { test, assert, snack } = require('./fixtures/core.fixture.cjs')

test('간식 이동은 인접 레인과 최소 입력 간격 및 경계를 지킴', () => {
  const recorder = new snack.SnackInputRecorder()
  assert.equal(recorder.move(-1, 0), true)
  assert.equal(recorder.lane, 0)
  assert.equal(recorder.move(-1, 100), false)
  assert.equal(recorder.move(1, 79), false)
  assert.equal(recorder.move(1, 80), true)
  assert.equal(recorder.move(1, 160), true)
  assert.equal(recorder.move(1, 240), false)
  for (const at of [-1, Infinity, NaN, 30001]) assert.equal(recorder.move(-1, at), false)
  const original = recorder.snapshot()
  original[0].lane = 2
  assert.equal(recorder.snapshot()[0].lane, 0)
  let time = 240
  while (recorder.snapshot().length < 180) {
    recorder.move(recorder.lane === 2 ? -1 : 1, time)
    time += 80
  }
  assert.equal(recorder.move(-1, time), false)
  const inputs = recorder.snapshot()
  let lane = 1
  inputs.forEach((input, index) => {
    assert.equal(Math.abs(input.lane - lane), 1)
    if (index) assert.ok(input.tMs - inputs[index - 1].tMs >= 80)
    lane = input.lane
  })
})

test('간식 미리보기는 착지 경계와 방해물을 재현하고 점수를 음수로 만들지 않음', () => {
  const challenge = {
    drops: [
      { lane: 1, kind: 'hazard', landingAtMs: 2000 },
      { lane: 0, kind: 'snack', landingAtMs: 3000 },
      { lane: 2, kind: 'snack', landingAtMs: 4000 },
      { lane: 1, kind: 'snack', landingAtMs: 5000 },
      { lane: 1, kind: 'hazard', landingAtMs: 6000 },
    ],
  }
  const inputs = [
    { tMs: 3000, lane: 0 },
    { tMs: 4500, lane: 1 },
  ]
  assert.deepEqual(snack.previewSnack(challenge, inputs, 6000), {
    score: 0,
    catches: 2,
    hazards: 2,
    misses: 1,
  })
  assert.deepEqual(snack.previewSnack(challenge, inputs, 2999), {
    score: 0,
    catches: 0,
    hazards: 1,
    misses: 0,
  })
  const drops = Array.from({ length: 28 }, (_, index) => ({
    lane: 1,
    kind: (index + 1) % 6 === 0 ? 'hazard' : 'snack',
    landingAtMs: 2000 + index * 1000,
  }))
  assert.equal(snack.previewSnack({ drops }, [], 30000).catches, 24)
})

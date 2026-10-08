const { test } = require('node:test')
const assert = require('node:assert/strict')
const { mood, stats } = require('./fixtures/model.fixture.cjs')

test('기분은 서버 수치만 읽고 필요한 돌봄 하나를 우선순위대로 알려 준다', () => {
  assert.equal(mood.petMood(stats(), false), null)
  assert.deepEqual(
    [
      mood.petMood(stats({ fullness: 10, energy: 10, mood: 10 }), false),
      mood.petMood(stats({ energy: 10, mood: 10 }), false),
      mood.petMood(stats({ mood: 10 }), false),
    ].map((value) => [value.kind, value.action]),
    [
      ['hungry', 'feed'],
      ['sleepy', 'rest'],
      ['bored', 'play'],
    ],
  )
  const happy = mood.petMood(stats({ fullness: 90, mood: 90, energy: 80 }), false)
  assert.equal(happy.kind, 'happy')
  assert.equal(happy.action, null)
  // 쉬는 동안에는 낮은 수치여도 다른 돌봄을 재촉하지 않는다.
  assert.equal(mood.petMood(stats({ fullness: 0 }), true).kind, 'resting')
})

test('레벨업 알림은 같은 친구의 서버 레벨이 오른 순간에만 뜬다', () => {
  assert.equal(mood.petLevelUp(null, { id: 'a', level: 3 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 2 }, { id: 'a', level: 3 }), 3)
  assert.equal(mood.petLevelUp({ id: 'a', level: 3 }, { id: 'a', level: 3 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 3 }, { id: 'a', level: 2 }), null)
  assert.equal(mood.petLevelUp({ id: 'a', level: 1 }, { id: 'b', level: 5 }), null)
  assert.equal(mood.formatPetCountdown(0), '0:00')
  assert.equal(mood.formatPetCountdown(899.9), '14:59')
  assert.equal(mood.formatPetCountdown(-4), '0:00')
})

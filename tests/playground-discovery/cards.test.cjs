const { test } = require('node:test')
const assert = require('node:assert/strict')
const { constants, model, allCards } = require('./fixtures/discovery.fixture.cjs')

test('산책 뽑기는 같은 차례면 같은 카드를 주고 연속으로 뽑으면 묶음 안의 다른 카드로 넘어감', () => {
  for (const setting of ['outside', 'inside'])
    for (const pace of ['slow', 'curious']) {
      const size = model.outingDeckSize(setting, pace)
      const seen = new Set()
      for (let turn = 0; turn < size; turn++) {
        const card = model.outingCard(setting, pace, turn)
        assert.strictEqual(model.outingCard(setting, pace, turn + size), card)
        assert.notStrictEqual(model.outingCard(setting, pace, turn + 1), card)
        seen.add(card.id)
      }
      assert.equal(seen.size, size)
    }
})

test('잘못된 차례 값은 첫 카드로 돌아가고 예외를 내지 않음', () => {
  const first = model.outingCard('outside', 'slow', 0)
  for (const turn of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 60])
    assert.strictEqual(model.outingCard('outside', 'slow', turn), first)
})

test('취향 결과는 네 질문 모두 유효하게 답했을 때만 만들어짐', () => {
  for (const answers of [
    [],
    [0, 0, 0],
    [0, 0, 0, 4],
    [0, 0, 0, -1],
    [0, 0, 0, 1.5],
    [0, 0, 0, 0, 0],
  ])
    assert.equal(model.tasteResult(answers), null)
  assert.equal(model.tasteResult([0, 0, 0, 0]).id, 'taste-explorer')
  assert.equal(model.tasteResult([3, 3, 2, 3]).id, 'taste-dreamer')
})

test('취향 점수가 같으면 마지막 질문에 더 가까운 선택을 따름', () => {
  assert.equal(model.tasteResult([0, 1, 0, 1]).id, 'taste-observer')
  assert.equal(model.tasteResult([1, 0, 1, 0]).id, 'taste-explorer')
  assert.equal(model.tasteResult([0, 1, 2, 3]).id, 'taste-dreamer')
})

test('네 가지 취향 카드 모두 실제로 나올 수 있음', () => {
  const reached = new Set()
  for (let a = 0; a < 4; a++)
    for (let b = 0; b < 4; b++)
      for (let c = 0; c < 4; c++)
        for (let d = 0; d < 4; d++) reached.add(model.tasteResult([a, b, c, d]).id)
  assert.equal(reached.size, constants.TASTE_ORDER.length)
})

test('멍냥BTI 는 축마다 3문항이라 동점 없이 정해지고, 12문항 모두 답했을 때만 결과가 나옴', () => {
  const perAxis = { EI: 0, SN: 0, TF: 0, JP: 0 }
  for (const { options } of constants.BTI_QUESTIONS) {
    const axis = Object.keys(perAxis).find(
      (key) => key.includes(options[0].letter) && key.includes(options[1].letter),
    )
    assert.ok(axis && options[0].letter !== options[1].letter, JSON.stringify(options))
    perAxis[axis] += 1
  }
  assert.deepEqual(perAxis, { EI: 3, SN: 3, TF: 3, JP: 3 })

  for (const answers of [[], Array(11).fill(0), [...Array(11).fill(0), 2], Array(13).fill(0)])
    assert.equal(model.btiResult(answers), null)

  // 각 문항에서 원하는 글자 쪽 선택지를 고른다
  const choose = (type) =>
    constants.BTI_QUESTIONS.map(({ options }) => (type.includes(options[0].letter) ? 0 : 1))
  assert.equal(model.btiResult(choose('ENFP')).title, 'ENFP 동네 인싸 탐험가')
  assert.equal(model.btiResult(choose('ISTJ')).id, 'bti-istj')
})

test('멍냥BTI 16유형이 모두 실제로 나오고, 찰떡 친구는 서로를 가리킴', () => {
  const reached = new Set()
  for (let mask = 0; mask < 2 ** 12; mask++)
    reached.add(model.btiResult(Array.from({ length: 12 }, (_, i) => (mask >> i) & 1)).id)
  assert.equal(reached.size, 16)
  assert.equal(model.BTI_CARDS.length, 16)

  const byType = new Map(model.BTI_CARDS.map((card) => [card.title.slice(0, 4), card]))
  for (const [type, card] of byType) {
    const partner = card.moments[2].match(/^찰떡 친구: ([EI][SN][TF][JP]) /)[1]
    assert.notEqual(partner, type)
    assert.match(byType.get(partner).moments[2], new RegExp(`^찰떡 친구: ${type} `))
  }
})

test('모든 놀이 카드는 고유 식별자와 44자 이하 추억 문구를 가짐', () => {
  const cards = allCards()
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length)
  for (const card of cards) {
    assert.match(card.id, /^[a-z-]{3,40}$/)
    assert.ok([...card.memoryMessage].length > 0 && [...card.memoryMessage].length <= 44, card.id)
    assert.ok(card.moments.length >= 3, card.id)
  }
})

const { test, assert, presentation, view } = require('./fixtures/core.fixture.cjs')

test('이름은 정규화 후 한 글자부터 열두 글자를 허용하고 공백과 제어 문자를 거부함', () => {
  assert.equal(presentation.normalizePetName('  도토리  '), '도토리')
  for (const name of ['도', '도토리', '가'.repeat(12), '\u{1F436}'.repeat(12)])
    assert.equal(presentation.isValidPetName(name), true)
  for (const name of ['', '  ', '가'.repeat(13), '도\n토리', '도\u200b토리'])
    assert.equal(presentation.isValidPetName(name), false)
})

test('성장 표시는 서버 기준값과 최대 레벨을 사용함', () => {
  assert.equal(presentation.petLevelProgress(view(1).pet), 3)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, totalXp: 9000 }), 100)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, totalXp: 0 }), 0)
  assert.equal(presentation.petLevelProgress({ ...view(1).pet, xpForNextLevel: null }), 100)
})

test('이전 멱등 응답은 최신 상태를 덮지 않고 더 큰 수정 번호만 반영함', () => {
  const current = view(9)
  assert.equal(presentation.latestPetView(current, view(2)), current)
  assert.equal(presentation.latestPetView(current, view(10)).pet.revision, 10)
  assert.equal(presentation.latestPetView(undefined, view(2)).pet.revision, 2)
})

test('표시 시간이 끝나도 권한을 임의로 만들지 않고 보상 없는 돌봄을 안내함', () => {
  assert.equal(
    presentation.remainingSeconds('2026-10-03T12:01:30Z', Date.parse('2026-10-03T12:00:00Z')),
    90,
  )
  assert.equal(
    presentation.remainingSeconds('2026-10-03T12:00:00Z', Date.parse('2026-10-04T12:00:00Z')),
    0,
  )
  assert.match(
    presentation.petActionHint(
      { allowed: false, nextAvailableAt: '2026-10-03T12:00:00Z', reason: 'COOLDOWN' },
      Date.parse('2026-10-04T12:00:00Z'),
    ),
    /확인/,
  )
  assert.match(
    presentation.petActionHint(
      { allowed: true, rewardAvailable: false, nextAvailableAt: '2026-10-04T00:00:00Z' },
      Date.parse('2026-10-03T12:00:00Z'),
    ),
    /경험치 없이/,
  )
})

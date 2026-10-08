const { test, assert } = require('./fixtures/core.fixture.cjs')
const { studioMarkup } = require('./fixtures/studio.fixture.cjs')

test('확인 대기 안내는 새 생성 대신 읽기 전용 재확인과 보관함을 제공함', () => {
  const markup = studioMarkup('pending')
  assert.match(markup, /결과 다시 확인/)
  assert.match(markup, /보관함 확인/)
  assert.match(markup, /\/home\?tab=ai-photos/)
  assert.doesNotMatch(markup, /포퐁 도트 초상화 씌우기|timeout of|role="alert"/)
  assert.doesNotMatch(studioMarkup('pending', false), /결과 다시 확인/)
})

test('재연결 안내는 기존 작업을 설명하고 생성 실패로 표시하지 않음', () => {
  const markup = studioMarkup('reconnecting')
  assert.match(markup, /같은 사진의 결과를 다시 확인/)
  assert.match(markup, /생성 횟수를 추가로 쓰지 않/)
  assert.doesNotMatch(markup, /timeout of|role="alert"/)
})

test('결제 출시 전에는 이용권 구매 이동 없이 무료 횟수만 표시함', () => {
  const markup = studioMarkup('idle', true, {
    allowance: { remaining: 0, freeRemaining: 0, dailyFreeLimit: 3, enabled: true },
  })
  assert.match(markup, /오늘 무료 0\/3회/)
  assert.match(markup, /오늘 만들 수 있는 횟수를 모두 사용했어요/)
  assert.doesNotMatch(markup, /이용권|href="\/playground"/)
})

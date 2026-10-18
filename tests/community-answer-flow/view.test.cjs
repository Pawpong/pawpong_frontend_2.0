const { test } = require('node:test')
const assert = require('node:assert/strict')
const { answerViewFixture, context, session, post } = require('./fixtures/view.fixture.cjs')
const { answer } = require('./fixtures/hook.fixture.cjs')

test('첫 답변은 자동 생성하지 않고 제목 전달 동의와 횟수 안내를 표시한다', () => {
  const h = answerViewFixture()
  const html = h.render()
  assert.equal(h.mutations(), 0)
  assert.match(html, /아직 AI 답변이 없어요/)
  assert.match(html, /질문 제목·본문과 주제/)
  assert.match(html, /사진·지도 좌표는 전달하지 않습니다/)
  assert.match(html, /실패해도 횟수에 포함될 수 있어요/)
  assert.match(html, /disabled=""/)
})

test('최초 조회 중에는 빈 상태나 생성 동의 폼을 표시하지 않는다', () => {
  const html = answerViewFixture({ result: { isPending: true, isFetching: true } }).render()
  assert.match(html, /저장된 답변을 확인하고 있어요/)
  assert.doesNotMatch(html, /아직 AI 답변이 없어요|type="checkbox"/)
})

test('접수 재확인 중에는 생성 대신 읽기 상태를 안내한다', () => {
  const html = answerViewFixture({ phase: 'checking' }).render()
  assert.match(html, /생성 요청은 다시 보내지 않아요/)
  assert.doesNotMatch(html, /type="checkbox"|아직 AI 답변이 없어요/)
})

test('조회 실패 시 생성 폼을 감추고 읽기 재확인 버튼만 제공한다', () => {
  const html = answerViewFixture({ result: { isError: true } }).render()
  assert.match(html, /답변 상태를 다시 확인하기/)
  assert.doesNotMatch(html, /type="checkbox"/)
})

test('완료된 건강 답변은 참고 경고를 유지하고 생성 폼은 감춘다', () => {
  const html = answerViewFixture({ result: { data: answer() } }).render()
  assert.match(html, /합성 참고 답변/)
  assert.match(html, /담당 수의사/)
  assert.doesNotMatch(html, /type="checkbox"/)
})

test('질문의 모든 원천 필드와 계정이 바뀌면 동의 화면 키를 분리한다', () => {
  const key = context.communityAnswerContext(post, true, session)
  for (const patch of [
    { title: '다른 제목' },
    { body: '다른 본문' },
    { experience: { ...post.experience, topics: ['clinic'] } },
    { experience: { ...post.experience, question: false } },
    { visibility: 'private' },
    { status: 'draft' },
  ])
    assert.notEqual(context.communityAnswerContext({ ...post, ...patch }, true, session), key)
  assert.notEqual(
    context.communityAnswerContext(post, true, { ...session, scope: '다른 계정' }),
    key,
  )
  assert.equal(
    context.communityAnswerContext({ ...post, photoUrls: ['합성 사진'] }, true, session),
    key,
  )
})

test('같은 계정의 토큰 갱신은 동의 키를 유지하고 계정과 역할 변경은 요청을 막는다', () => {
  assert.equal(context.canRequestCommunityAnswer(post, true, session), true)
  assert.equal(
    context.canRequestCommunityAnswer(post, true, {
      ...session,
      identity: JSON.stringify(['breeder', post.authorId]),
    }),
    false,
  )
  assert.equal(
    context.canRequestCommunityAnswer(post, true, {
      ...session,
      identity: JSON.stringify(['adopter', '다른 보호자']),
    }),
    false,
  )
  assert.doesNotMatch(answerViewFixture({}, null).render(), /type="checkbox"/)
})

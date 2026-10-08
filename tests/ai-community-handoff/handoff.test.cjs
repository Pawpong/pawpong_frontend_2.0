const { test } = require('node:test')
const assert = require('node:assert/strict')
const { handoffFixture, photo } = require('./fixtures/handoff.fixture.cjs')
test('같은 작성자에게 명시적으로 넘긴 결과와 비교 선택만 한 번 전달함', () => {
  const h = handoffFixture(),
    result = photo('결과')
  h.setPendingCommunityPhoto(result, undefined, 'owned-job', h.session)
  assert.deepEqual(h.takePendingCommunityPost('ai-photo'), {
    files: [result],
    jobId: 'owned-job',
    aiComparison: null,
  })
  assert.equal(h.takePendingCommunityPost('ai-photo'), null)
})
test('계정 전환과 로그아웃 및 다시 로그인한 세대에는 이전 사진을 전달하지 않음', () => {
  for (const change of [
    (state) => (state.identity = 'owner-b'),
    (state) => (state.active = false),
    (state) => state.generation++,
  ]) {
    const h = handoffFixture()
    h.setPendingCommunityPhoto(photo('이전 사진'), undefined, undefined, h.session)
    change(h.state)
    assert.equal(h.takePendingCommunityPost('ai-photo'), null)
  }
})
test('일반 글쓰기나 추억 카드 진입에는 남아 있는 AI 사진을 끼워 넣지 않음', () => {
  for (const source of [undefined, 'memory-card']) {
    const h = handoffFixture()
    h.setPendingCommunityPhoto(photo('결과'), undefined, undefined, h.session)
    assert.equal(h.takePendingCommunityPost(source), null)
    assert.equal(h.takePendingCommunityPost('ai-photo'), null)
  }
})
test('다섯 분이 지난 사진은 백그라운드 타이머가 멈췄어도 전달하지 않음', () => {
  const h = handoffFixture()
  h.setPendingCommunityPhoto(photo('결과'), undefined, undefined, h.session)
  h.state.now += 5 * 60_000
  assert.equal(h.takePendingCommunityPost('ai-photo'), null)
})
test('이전 세션에서 시작한 작업은 새 계정의 전달함에 사진을 넣지 못함', () => {
  const h = handoffFixture()
  h.state.identity = 'owner-b'
  assert.throws(() =>
    h.setPendingCommunityPhoto(photo('이전 결과'), undefined, undefined, h.session),
  )
  assert.equal(h.takePendingCommunityPost('ai-photo'), null)
})
test('이전 계정의 늦은 쓰기는 새 계정이 선택한 사진도 지우지 못함', () => {
  const h = handoffFixture(),
    next = photo('새 사진')
  h.state.identity = 'owner-b'
  h.setPendingCommunityPhoto(next, undefined, undefined, { ...h.session, identity: 'owner-b' })
  assert.throws(() =>
    h.setPendingCommunityPhoto(photo('이전 결과'), undefined, undefined, h.session),
  )
  assert.equal(h.takePendingCommunityPost('ai-photo').files[0], next)
})
test('동의한 원본 비교만 전달하며 소모 후 이벤트와 만료 타이머를 정리함', () => {
  const h = handoffFixture(),
    result = photo('결과'),
    original = photo('원본')
  h.setPendingCommunityPhoto(result, original, 'owned-job', h.session)
  assert.equal(h.listeners.size, 4)
  assert.deepEqual(h.takePendingCommunityPost('ai-photo'), {
    files: [result, original],
    jobId: 'owned-job',
    aiComparison: { beforePhotoIndex: 1, afterPhotoIndex: 0 },
  })
  assert.equal(h.listeners.size, 0)
})
test('다른 탭의 로그아웃 통지는 현재 쿠키가 같아 보여도 전달함을 비움', () => {
  for (const key of [null, 'pawpong:logout-pending']) {
    const h = handoffFixture()
    h.setPendingCommunityPhoto(photo('결과'), undefined, undefined, h.session)
    h.emit('storage', { key })
    assert.equal(h.takePendingCommunityPost('ai-photo'), null)
    assert.equal(h.listeners.size, 0)
  }
})
test('활성 탭 복귀와 만료 타이머는 기한이 지난 사진 참조를 해제함', () => {
  for (const finish of [
    (h) => h.expire(),
    (h) => {
      h.state.now += 300000
      h.emit('focus')
    },
  ]) {
    const h = handoffFixture()
    h.setPendingCommunityPhoto(photo('결과'), undefined, undefined, h.session)
    finish(h)
    assert.equal(h.takePendingCommunityPost('ai-photo'), null)
    assert.equal(h.listeners.size, 0)
  }
})

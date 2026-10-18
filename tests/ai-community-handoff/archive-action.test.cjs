const { test } = require('node:test')
const assert = require('node:assert/strict')
const { archiveActionFixture, deferred, token } = require('./fixtures/archive-action.fixture.cjs')

test('사진 불러오기 중 중복 실행과 취소 뒤 글쓰기 이동을 차단함', async () => {
  const pending = deferred()
  const h = archiveActionFixture({ image: () => pending.promise })
  const first = h.render().run('post')
  assert.equal(await h.render().run('post'), false)
  h.render().cancel()
  assert.equal(h.calls.image[0][2].aborted, true)
  pending.resolve(h.file)
  assert.equal(await first, false)
  assert.deepEqual(h.calls.push, [])
  assert.deepEqual(h.calls.handoff, [])
  assert.equal(h.render().busy, null)
})

test('화면 종료와 사진 교체 및 계정 변경은 늦은 응답을 폐기함', async () => {
  for (const change of [
    (h) => h.unmount(),
    (h) => h.render('another'),
    (h) => {
      h.state.token = token('account-b')
    },
  ]) {
    const pending = deferred()
    const h = archiveActionFixture({ image: () => pending.promise })
    const request = h.render().run('post')
    change(h)
    pending.resolve(h.file)
    assert.equal(await request, false)
    assert.deepEqual(h.calls.push, [])
    assert.deepEqual(h.calls.handoff, [])
  }
})

test('원본 비교에 동의한 경우에만 원본을 조회하고 명시적인 글쓰기 경로로 이동함', async () => {
  for (const compare of [false, true]) {
    const h = archiveActionFixture()
    assert.equal(await h.render().run('post', compare), true)
    assert.equal(h.calls.source.length, compare ? 1 : 0)
    assert.equal(h.calls.handoff[0][1], compare ? h.file : undefined)
    assert.equal(h.calls.handoff[0][3], h.session)
    assert.deepEqual(h.calls.push, ['/community/write?source=ai-photo'])
    h.unmount()
  }
})

test('원본 조회 중 취소하면 비교 사진도 글쓰기로 전달하지 않음', async () => {
  const pending = deferred()
  const h = archiveActionFixture({ source: () => pending.promise })
  const request = h.render().run('post', true)
  await Promise.resolve()
  h.render().cancel()
  pending.resolve(h.file)
  assert.equal(await request, false)
  assert.deepEqual(h.calls.handoff, [])
})

test('사진 조회 실패를 안전한 문구로 안내하고 같은 화면에서 다시 시도할 수 있음', async () => {
  let failed = true
  const h = archiveActionFixture({
    image: () => {
      if (failed) throw new Error('private detail')
      return h.file
    },
  })
  assert.equal(await h.render().run('post'), false)
  assert.match(h.render().error, /다시 시도/)
  assert.doesNotMatch(h.render().error, /private detail/)
  assert.equal(h.render().busy, null)
  failed = false
  assert.equal(await h.render().run('post'), true)
  assert.equal(h.render().error, null)
})

test('삭제 실패는 목록을 갱신하지 않고 성공하면 해당 작성자의 보관함만 갱신함', async () => {
  let failed = true
  const h = archiveActionFixture({
    hide: () => {
      if (failed) throw new Error('failure')
    },
  })
  assert.equal(await h.render().run('hide'), false)
  assert.match(h.render().error, /지우지 못/)
  assert.equal(h.calls.invalidate.length, 0)
  failed = false
  assert.equal(await h.render().run('hide'), true)
  assert.deepEqual(
    h.calls.invalidate[0][0].queryKey,
    h.queries.myGenerations(true, h.session).queryKey,
  )
  assert.equal(h.calls.hide[0][2], h.session)
  assert.equal(h.calls.image.length, 0)
})

test('이전 계정의 작업을 시작하지 않고 저장 실패도 재시도할 수 있음', async () => {
  const h = archiveActionFixture({
    save: () => {
      throw new Error('failure')
    },
  })
  assert.equal(await h.render().run('save'), false)
  assert.match(h.render().error, /다시 시도/)
  h.state.token = token('account-b')
  assert.equal(await h.render().run('post'), false)
  assert.equal(h.calls.image.length, 1)
})

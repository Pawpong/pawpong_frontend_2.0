const { test } = require('node:test')
const assert = require('node:assert/strict')
const { body, pixel, photoResponse } = require('./fixtures/photo-access.fixture.cjs')

test('사진 길이와 본문을 검증하고 원본 바이트를 보존한다', async () => {
  const result = await body.readCommunityPhotoBody(photoResponse(), new AbortController().signal)
  assert.equal(result.contentType, 'image/png')
  assert.deepEqual(Buffer.from(result.bytes), pixel)
})

test('허용하지 않은 형식과 잘못된 길이는 본문을 읽지 않고 취소한다', async () => {
  for (const headers of [
    { 'content-type': 'image/svg+xml' },
    { 'content-type': 'text/html' },
    ...['0', '-1', '1.5', 'invalid', String(body.COMMUNITY_PHOTO_MAX_BYTES + 1)].map((value) => ({
      'content-type': 'image/png',
      'content-length': value,
    })),
  ]) {
    let cancelled = false
    const response = new Response(
      new ReadableStream({
        cancel() {
          cancelled = true
        },
      }),
      { headers },
    )
    await assert.rejects(body.readCommunityPhotoBody(response, new AbortController().signal))
    assert.equal(cancelled, true)
  }
})

test('길이 헤더 없는 사진도 실제 바이트 한도를 넘으면 취소한다', async () => {
  let cancelled = false
  const response = new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(body.COMMUNITY_PHOTO_MAX_BYTES + 1))
      },
      cancel() {
        cancelled = true
      },
    }),
    { headers: { 'content-type': 'image/png' } },
  )
  await assert.rejects(body.readCommunityPhotoBody(response, new AbortController().signal))
  assert.equal(cancelled, true)
})

test('빈 사진과 중간에 잘린 사진을 거부한다', async () => {
  for (const bytes of [new Uint8Array(), pixel]) {
    await assert.rejects(
      body.readCommunityPhotoBody(
        new Response(bytes, { headers: { 'content-type': 'image/png', 'content-length': '100' } }),
        new AbortController().signal,
      ),
    )
  }
})

test('다운로드 중 취소되면 대기 중인 스트림을 닫고 바이트를 반환하지 않는다', async () => {
  const controller = new AbortController()
  let cancelled = false
  const response = new Response(
    new ReadableStream({
      cancel() {
        cancelled = true
      },
    }),
    { headers: { 'content-type': 'image/png' } },
  )
  const reading = body.readCommunityPhotoBody(response, controller.signal)
  controller.abort()
  await assert.rejects(reading)
  assert.equal(cancelled, true)
})

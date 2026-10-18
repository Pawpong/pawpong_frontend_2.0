const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setup } = require('./fixtures/route.fixture.cjs')
const { readBoundedJson } = setup('set-cookie').load('src/shared/lib/server/readBoundedJson.ts')

test('본문 크기는 한글의 문자 수가 아닌 실제 바이트로 제한함', async () => {
  const text = JSON.stringify({ name: '포퐁' })
  const bytes = Buffer.byteLength(text)
  const request = () =>
    new Request('https://synthetic.invalid', {
      method: 'POST',
      body: text,
      headers: { 'content-length': '1' },
    })
  assert.deepEqual(await readBoundedJson(request(), bytes), { name: '포퐁' })
  assert.equal(await readBoundedJson(request(), bytes - 1), null)
})

test('나누어 받은 본문도 누적 제한을 초과하면 읽기를 취소하고 잠금을 해제함', async () => {
  let cancelled = false
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(4))
      controller.enqueue(new Uint8Array(4))
    },
    cancel() {
      cancelled = true
    },
  })
  assert.equal(await readBoundedJson({ body: stream }, 6), null)
  assert.equal(cancelled, true)
  assert.equal(stream.locked, false)
})

test('잘못된 JSON과 스트림 오류에서도 본문 잠금을 해제함', async () => {
  const invalid = new Request('https://synthetic.invalid', { method: 'POST', body: '{' })
  await assert.rejects(readBoundedJson(invalid, 1024), SyntaxError)
  assert.equal(invalid.body.locked, false)
  const stream = new ReadableStream({
    start(controller) {
      controller.error(new Error('합성 오류'))
    },
  })
  await assert.rejects(readBoundedJson({ body: stream }, 1024), /합성 오류/)
  assert.equal(stream.locked, false)
})

test('본문이 없는 요청은 빈 결과로 반환함', async () => {
  assert.equal(await readBoundedJson(new Request('https://synthetic.invalid'), 1024), null)
})

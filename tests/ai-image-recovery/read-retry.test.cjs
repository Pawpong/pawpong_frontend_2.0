const { test, assert, ApiError, recovery, advance, clock } = require('./fixtures/core.fixture.cjs')

test('일시적인 API 실패만 재시도하고 알 수 없는 오류는 노출하지 않음', () => {
  for (const status of [undefined, 408, 429, 500, 502, 503, 504])
    assert.equal(recovery.isRetryableAiImageError(new ApiError('fixture', status)), true)
  for (const status of [200, 400, 401, 403, 404, 409, 422])
    assert.equal(recovery.isRetryableAiImageError(new ApiError('fixture', status)), false)
  assert.equal(recovery.isRetryableAiImageError(new Error('programming error')), false)
  assert.doesNotMatch(recovery.aiImageErrorMessage(new Error('internal stack details')), /internal/)
  for (const status of [401, 403, 404])
    assert.doesNotMatch(
      recovery.aiImageErrorMessage(
        new ApiError(`Request failed with status code ${status}`, status),
      ),
      /Request failed/,
    )
})

test('조회 제한 시간은 다음 요청의 시간을 제한하고 추가 조회를 중단함', async (t) => {
  clock(t)
  let remaining,
    reads = 0
  const controller = new AbortController()
  const work = recovery.readAiImageWithRetry(
    (budget) => {
      reads++
      remaining = budget
      throw new ApiError('timeout')
    },
    { signal: controller.signal, deadline: Date.now() + 100, onRetry() {} },
  )
  const rejection = assert.rejects(work, recovery.AiImagePendingError)
  await advance(t, 100)
  await rejection
  assert.equal(remaining, 100)
  assert.equal(reads, 1)
})

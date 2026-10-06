const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextRequest } = require('next/server')
const { load, model, held } = require('./fixtures/community-review.fixture.cjs')

test('심사 설정은 명시적 true와 유효한 한도 및 안내만 허용함', () => {
  const config = { enabled: true, dailyLimit: 10, notice: 'AI 처리 안내', secret: 'synthetic' }
  assert.deepEqual(model.parseCommunityReviewConfig(config), {
    enabled: true,
    dailyLimit: 10,
    notice: 'AI 처리 안내',
  })
  for (const patch of [
    { enabled: 'true' },
    { dailyLimit: 0 },
    { dailyLimit: 1.5 },
    { dailyLimit: 101 },
    { notice: '' },
  ])
    assert.throws(() => model.parseCommunityReviewConfig({ ...config, ...patch }))
  assert.deepEqual(
    model.parseCommunityReviewConfig({ enabled: false }),
    model.CLOSED_COMMUNITY_REVIEW_CONFIG,
  )
})
test('작성자 상태는 안전한 필드만 남기고 손상된 승인은 보류로 닫음', () => {
  assert.equal(model.parseCommunityPostReview(undefined), undefined)
  assert.deepEqual(
    model.parseCommunityPostReview({ ...held(), sourceHash: 'synthetic', claimKey: 'synthetic' }),
    held(),
  )
  for (const value of [
    null,
    { ...held(), state: 'approved' },
    { ...held(), checkedPhotoCount: 11 },
    { ...held(), state: { toString: 'approved' } },
  ])
    assert.equal(model.parseCommunityPostReview(value).state, 'held')
  const approval = { ...held(), state: 'approved', reason: 'relevant', canRequestReview: false }
  assert.equal(
    model.isCommunityPostHeld({ aiReview: model.parseCommunityPostReview(approval) }),
    false,
  )
  assert.equal(model.isCommunityPostHeld({ aiReview: model.parseCommunityPostReview(null) }), true)
})
test('운영과 알 수 없는 호스트는 설정 API를 호출하지 않고 닫음', async () => {
  let calls = 0
  const host = load('src/shared/lib/server/developmentCommunityHost.ts')
  const route = load(
    'src/app/api/community/review/route.ts',
    {
      '@/shared/lib/server': host,
      '@/entities/community': model,
    },
    {
      fetch: async () => {
        calls++
        return Response.json({
          success: true,
          data: { enabled: true, dailyLimit: 10, notice: '안내' },
        })
      },
    },
  )
  for (const domain of ['pawpong.kr', 'admin.pawpong.kr', 'feature.vercel.app']) {
    const response = await route.GET(
      new NextRequest(`https://${domain}/api/community/review/config`, {
        headers: { host: domain },
      }),
    )
    assert.equal((await response.json()).enabled, false)
    assert.equal(response.headers.get('cache-control'), 'no-store')
  }
  assert.equal(calls, 0)
})
test('개발 설정 조회는 인증을 전달하지 않고 캐시 없이 검증하며 오류는 닫음', async () => {
  const host = load('src/shared/lib/server/developmentCommunityHost.ts')
  let payload = { enabled: true, dailyLimit: 10, notice: '안내', sourceHash: 'synthetic' }
  const calls = []
  const route = load(
    'src/app/api/community/review/route.ts',
    {
      '@/shared/lib/server': host,
      '@/entities/community': model,
    },
    {
      fetch: async (...args) => {
        calls.push(args)
        return Response.json({ success: true, data: payload })
      },
    },
  )
  const request = new NextRequest('https://dev.pawpong.kr/api/community/review/config', {
    headers: { host: 'dev.pawpong.kr', authorization: 'synthetic' },
  })
  assert.deepEqual(await (await route.GET(request)).json(), {
    enabled: true,
    dailyLimit: 10,
    notice: '안내',
  })
  assert.equal(calls[0][1].headers, undefined)
  assert.equal(calls[0][1].cache, 'no-store')
  assert.equal(calls[0][1].redirect, 'error')
  payload = { enabled: 'true' }
  const failed = await route.GET(request)
  assert.equal(failed.status, 503)
  assert.equal((await failed.json()).enabled, false)
})

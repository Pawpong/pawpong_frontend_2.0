const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextRequest } = require('next/server')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

test('활동 설정은 정확한 개발 호스트에서만 조회하고 운영은 외부 호출 없이 닫는다', async () => {
  let calls = 0
  const route = load(
    'src/app/api/gamification/config/route.ts',
    {},
    {
      process: { env: { NEXT_PUBLIC_APP_ENV: 'development' } },
      fetch: async () => {
        calls++
        return Response.json({ success: true, data: { enabled: true } })
      },
    },
  )
  for (const host of ['pawpong.kr', 'dev.pawpong.kr.example.test', 'preview.vercel.app']) {
    const response = await route.GET(
      new NextRequest(`https://${host}/api/gamification/config`, { headers: { host } }),
    )
    assert.equal((await response.json()).enabled, false)
    assert.match(response.headers.get('cache-control'), /no-store/)
  }
  assert.equal(calls, 0)
  const response = await route.GET(
    new NextRequest('https://dev.pawpong.kr/api/gamification/config', {
      headers: { host: 'dev.pawpong.kr' },
    }),
  )
  assert.equal((await response.json()).enabled, true)
  assert.equal(calls, 1)
})

test('설정 조회 실패는 활동 UI를 열지 않는다', async () => {
  const route = load(
    'src/app/api/gamification/config/route.ts',
    {},
    {
      fetch: async () => {
        throw new Error('fixture unavailable')
      },
    },
  )
  const response = await route.GET(
    new NextRequest('https://dev.pawpong.kr/api/gamification/config', {
      headers: { host: 'dev.pawpong.kr' },
    }),
  )
  assert.equal(response.status, 503)
  assert.equal((await response.json()).enabled, false)
})

function activityApi({ request, token = () => 'fixture-session', current = () => true } = {}) {
  return load('src/entities/gamification/api/activity.api.ts', {
    '@/shared/api': {
      apiClient: { get: request },
      API_VERSION: '/v2',
      unwrap: (value) => value.data,
    },
    '@/shared/api/token': { getAccessToken: token },
    '@/shared/lib/authSessionLifecycle': { isAuthSessionCurrent: current },
  })
}

test('대표 배지는 중복 제거와 50명 묶음으로 조회하고 인증을 전달하지 않는다', async () => {
  const calls = []
  const api = activityApi({
    request: async (url, config) => {
      calls.push({ url, config })
      return { data: [] }
    },
  })
  const owners = Array.from({ length: 51 }, (_, i) => ({
    ownerId: i.toString(16).padStart(24, '0'),
    role: 'adopter',
  }))
  await api.getPublicActivityBadges([...owners, owners[0]])
  assert.equal(calls.length, 2)
  assert.equal(calls[0].config.params.owners.split(',').length, 50)
  assert.equal(calls[1].config.params.owners.split(',').length, 1)
  assert.equal(calls[0].config.skipAuth, true)
  assert.equal(calls[0].config.skipAuthRefresh, true)
})

test('계정이 변경되면 늦게 도착한 이전 EXP 응답을 버린다', async () => {
  let token = 'first'
  const api = activityApi({ token: () => token })
  await assert.rejects(
    api.withActivitySession(0, async () => {
      token = 'second'
      return { totalExp: 100 }
    }),
    /계정이 변경/,
  )
  const missing = activityApi({ token: () => null })
  let requested = false
  await assert.rejects(
    missing.withActivitySession(0, async () => {
      requested = true
    }),
    /로그인/,
  )
  assert.equal(requested, false)
})

test('도트 배지는 접근성 이름을 제공하고 커뮤니티에는 최대 세 개만 표시한다', () => {
  const pixel = load('src/entities/gamification/ui/PixelActivityBadge.tsx')
  const row = load('src/entities/gamification/ui/ActivityBadgeRow.tsx', {
    './PixelActivityBadge': pixel,
  })
  const html = renderToStaticMarkup(
    createElement(pixel.PixelActivityBadge, {
      badgeKey: 'first_step',
      title: '첫 발걸음',
      locked: true,
    }),
  )
  assert.match(html, /aria-label="첫 발걸음"/)
  assert.match(html, /crispEdges/)
  assert.match(html, /grayscale/)
  const badges = Array.from({ length: 5 }, (_, i) => ({
    key: String(i),
    title: `활동 ${i}`,
    description: '참여 기록',
    earnedAt: '2026-10-06',
  }))
  const rendered = renderToStaticMarkup(createElement(row.ActivityBadgeRow, { badges }))
  assert.equal((rendered.match(/<svg/g) ?? []).length, 3)
  assert.equal(renderToStaticMarkup(createElement(row.ActivityBadgeRow, { badges: [] })), '')
})

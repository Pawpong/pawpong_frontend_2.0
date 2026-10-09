const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source } = require('./fixtures/alignment.fixture.cjs')

test('홈 배너는 첫 화면 슬라이드 이미지만 높은 우선순위로 받고 preload로 데스크톱에 안 쓰는 원본을 받지 않음', () => {
  const slide = source('src/widgets/banner/ui/BannerSlide.tsx')
  const banner = source('src/widgets/banner/ui/Banner.tsx')
  assert.match(slide, /fetchPriority=\{first \? 'high' : 'low'\}/)
  assert.doesNotMatch(slide, /\bpriority\b(?!\})/)
  assert.match(banner, /<BannerSlide banner=\{banner\} first=\{index === 0\} \/>/)
})

const { loadTypescript } = require('../helpers/load-typescript.cjs')

// 서버 배너 조회를 fetch 만 바꿔 실행한다. process.env 는 실행 때 읽으므로 호출 전후로 되돌린다.
async function initialBanners(fetchImpl, origin = 'https://api.example') {
  const calls = []
  const { getInitialBanners } = loadTypescript(
    'src/entities/home/api/home.server.ts',
    { 'server-only': {} },
    {
      fetch: async (url, init) => {
        calls.push({ url, init })
        return fetchImpl(url, init)
      },
    },
  )
  const previous = process.env.NEXT_PUBLIC_API_BASE_URL
  if (origin === null) delete process.env.NEXT_PUBLIC_API_BASE_URL
  else process.env.NEXT_PUBLIC_API_BASE_URL = origin
  try {
    return { result: await getInitialBanners(), calls }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL
    else process.env.NEXT_PUBLIC_API_BASE_URL = previous
  }
}

test('홈 첫 배너는 서버에서 익명으로 미리 받아 HTML 에 싣고 실패하면 브라우저 조회에 맡김', async () => {
  const banners = [{ bannerId: 'b1', order: 1 }]
  const ok = await initialBanners(async () => ({
    ok: true,
    json: async () => ({ success: true, data: banners }),
  }))
  assert.deepEqual(ok.result.banners, banners)
  assert.equal(typeof ok.result.fetchedAt, 'number')
  assert.equal(ok.calls[0].url, 'https://api.example/api/v2/home/banners')
  assert.equal(ok.calls[0].init.credentials, 'omit')
  assert.equal(ok.calls[0].init.next.revalidate, 60)
  assert.ok(ok.calls[0].init.signal)

  assert.equal((await initialBanners(async () => ({ ok: false }))).result, null)
  assert.equal(
    (
      await initialBanners(async () => {
        throw new Error('timeout')
      })
    ).result,
    null,
  )
  const missing = await initialBanners(async () => ({ ok: true }), null)
  assert.equal(missing.result, null)
  assert.equal(missing.calls.length, 0)

  const page = source('src/app/(main)/page.tsx')
  assert.match(page, /await getInitialBanners\(\)/)
  assert.match(page, /<Banner initial=\{initialBanners\} \/>/)
  const banner = source('src/widgets/banner/ui/Banner.tsx')
  assert.match(banner, /initialDataUpdatedAt: initial\.fetchedAt/)
})

test('서버가 그린 배너는 스와이퍼가 붙기 전에도 첫 장을 가운데에 둬 자리가 튀지 않음', () => {
  const css = source('src/app/globals.css')
  assert.match(
    css,
    /\.banner-swiper:not\(\.swiper-initialized\) \.swiper-wrapper \{\s*transform: translate3d\(calc\(\(100% - min\(70\.875rem, 78\.75vw\)\) \/ 2\), 0, 0\);/,
  )
  assert.match(
    css,
    /\.banner-swiper:not\(\.swiper-initialized\) \.swiper-slide \+ \.swiper-slide \{\s*transform: scale\(0\.85\);/,
  )
})

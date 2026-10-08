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

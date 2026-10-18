const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { hasLocalMatch } = require('next/dist/shared/lib/match-local-pattern')
const { load, file, postId } = require('./fixtures/photo-access.fixture.cjs')
const config = load('next.config.ts', {
  '@sentry/nextjs/config': { withSentryConfig: (value) => value },
}).default

test('이미지 최적화 주소를 직접 호출해도 인증 사진 API는 허용하지 않는다', () => {
  for (const path of [
    `/api/community/photos/owner/${file}`,
    `/api/community/photos/posts/${postId}/${file}`,
    `/api/v2/community/review/photos/${file}`,
    `/images/../api/community/photos/owner/${file}`,
    `/api/community/photos/owner/${file}?_session=synthetic`,
  ])
    assert.equal(hasLocalMatch(config.images.localPatterns, path), false)
})

test('현재 공개 이미지와 번들 정적 이미지의 최적화 계약은 유지한다', () => {
  const images = fs
    .readdirSync('public', { recursive: true })
    .filter((path) => /\.(?:png|jpe?g|gif|webp|svg|avif|ico)$/i.test(path))
  assert.ok(images.length > 0)
  for (const path of images)
    assert.equal(hasLocalMatch(config.images.localPatterns, `/${path}`), true, path)
  assert.equal(
    hasLocalMatch(config.images.localPatterns, '/_next/static/media/fixture.hash.png'),
    true,
  )
})

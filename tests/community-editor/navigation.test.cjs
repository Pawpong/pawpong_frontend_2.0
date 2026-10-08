const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const discovery = load('src/entities/community/model/discovery.ts')
const feed = load('src/entities/community/model/feed-navigation.ts', { './discovery': discovery })
const navigation = load('src/entities/community/model/editor-navigation.ts', {
  './feed-navigation': feed,
})
const { sameWindowLinkHref } = load('src/shared/lib/sameWindowLink.ts')
const current = 'https://example.invalid/community/write'
const event = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
}
const anchor = { href: '/ai-filter', target: '', hasAttribute: () => false }

test('새 글 닫기는 작성 전 커뮤니티 탐색 조건으로 돌아감', () => {
  const result = navigation.communityEditorExitHref({
    returnTo: '/community?search=공원&petType=dog&sort=popular&topics=walk&unknown=value',
  })
  const query = new URL(result, current).searchParams
  assert.equal(query.get('search'), '공원')
  assert.equal(query.get('petType'), 'dog')
  assert.equal(query.get('sort'), 'popular')
  assert.equal(query.get('topics'), 'walk')
  assert.equal(query.has('unknown'), false)
})
test('외부 주소와 작성 화면 및 변조된 복귀 주소는 커뮤니티로 제한함', () => {
  for (const returnTo of [
    undefined,
    '//evil.invalid',
    'https://evil.invalid',
    '/community/write',
    '/community/../admin',
    '/community#evil',
  ])
    assert.equal(navigation.communityEditorExitHref({ returnTo }), '/community')
})
test('임시저장 이어쓰기는 초안 상세가 아니라 임시보관함으로 돌아감', () => {
  assert.equal(navigation.communityEditorExitHref({ postId: '초안', status: 'draft' }), '/drafts')
  assert.equal(
    navigation.communityEditorExitHref({ postId: 'published', status: 'published' }),
    '/community/post/published',
  )
})
test('심사 유무와 무관하게 발행 글은 상세로 임시저장은 보관함으로 이동함', () => {
  assert.equal(navigation.communitySavedPostHref('published', 'saved'), '/community/post/saved')
  assert.equal(navigation.communitySavedPostHref('draft', 'saved'), '/drafts')
})
test('현재 창을 떠나는 내부 및 외부 링크만 이탈 확인 대상으로 반환함', () => {
  assert.equal(sameWindowLinkHref(event, anchor, current), '/ai-filter')
  assert.equal(
    sameWindowLinkHref(event, { ...anchor, href: 'https://external.invalid/path' }, current),
    'https://external.invalid/path',
  )
  assert.equal(sameWindowLinkHref(event, { ...anchor, href: '#photos' }, current), null)
  assert.equal(
    sameWindowLinkHref(event, { ...anchor, href: 'mailto:hello@example.invalid' }, current),
    null,
  )
})
test('새 탭과 보조 키 및 다운로드는 현재 작성 화면을 지우지 않아 가로채지 않음', () => {
  for (const patch of [
    { button: 1 },
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
    { defaultPrevented: true },
  ])
    assert.equal(sameWindowLinkHref({ ...event, ...patch }, anchor, current), null)
  assert.equal(sameWindowLinkHref(event, { ...anchor, target: '_blank' }, current), null)
  assert.equal(sameWindowLinkHref(event, { ...anchor, hasAttribute: () => true }, current), null)
})

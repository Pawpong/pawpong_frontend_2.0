const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')
const index = load('src/shared/lib/searchIndex.ts')
const {
  model,
  constants,
  share,
  fakeNavigator,
  abortError,
} = require('./playground-discovery/fixtures/discovery.fixture.cjs')
const links = load('src/features/playground-tools/model/playCardLinks.ts', {
  './discovery': model,
  '../constants/discovery': constants,
})
const id = '0123456789abcdef01234567'

test('every shared result has a stable public link and matching restart flow; arbitrary IDs have no content', () => {
  assert.equal(model.ALL_PLAY_CARDS.length, 32)
  assert.equal(new Set(model.ALL_PLAY_CARDS.map((card) => card.id)).size, 32)
  for (const card of model.ALL_PLAY_CARDS) {
    assert.equal(model.findPlayCard(card.id), card)
    assert.equal(links.playCardUrl(card), 'https://pawpong.kr' + links.playCardHref(card))
    assert.ok(links.playCardStart(card).href.startsWith('/playground/'))
    assert.doesNotMatch(links.playCardUrl(card), /[?#]/)
  }
  assert.equal(model.findPlayCard('../private'), null)
  assert.deepEqual(
    ['outing', 'taste', 'bti'].map((kind) => links.cardsInGroup(kind).length),
    [12, 4, 16],
  )
  assert.equal(
    links.playCardStart(model.findPlayCard('taste-detective')).href,
    '/playground/walk-card',
  )
})

test('native share and clipboard preserve the result link; cancellation never falls back or reports success', async () => {
  const content = {
    title: '놀이',
    text: '오늘의 카드',
    url: links.playCardUrl(model.ALL_PLAY_CARDS[0]),
  }
  const native = fakeNavigator({ share: async () => {} })
  assert.equal(await share.sharePlayCard(native.nav, content), 'shared')
  assert.deepEqual(native.calls, [['share', content]])
  const clip = fakeNavigator({ clipboard: async () => {} })
  assert.equal(await share.sharePlayCard(clip.nav, content), 'copied')
  assert.ok(clip.calls[0][1].endsWith(content.url))
  const cancel = fakeNavigator({
    share: async () => {
      throw abortError()
    },
    clipboard: async () => {},
  })
  assert.equal(await share.sharePlayCard(cancel.nav, content), 'cancelled')
  assert.equal(cancel.calls.length, 1)
})

test('index collection advances through empty pages, deduplicates and rejects unsafe or repeating cursors', async () => {
  const seen = []
  const ids = await index.collectPublicPostIds(async (before) => {
    seen.push(before)
    return before
      ? { items: [{ postId: id }, { postId: id }], nextCursor: null }
      : { items: [], nextCursor: 'ffffffffffffffffffffffff' }
  })
  assert.deepEqual(ids, [id])
  assert.equal(seen.length, 2)
  for (const value of [
    { items: [{ postId: '../private' }], nextCursor: null },
    { items: [], nextCursor: 'https://evil.test/' },
    { items: Array(501).fill({ postId: id }), nextCursor: null },
  ])
    assert.equal(index.publicIndexPage(value), null)
  await assert.rejects(
    index.collectPublicPostIds(async () => ({ items: [], nextCursor: id })),
    /cursor/,
  )
  assert.equal(index.searchIndexEnabled('production', 'preview'), false)
  assert.equal(index.searchIndexEnabled('development'), false)
  assert.equal(index.searchIndexEnabled('production', 'production'), true)
})

test('server post reads are anonymous, no-store and keep app consent filtering on native requests', async () => {
  for (const ua of ['Browser', 'PawpongApp/iOS', 'PawpongApp/Android']) {
    const calls = []
    const api = load(
      'src/app/_lib/publicCommunityPost.ts',
      {
        'server-only': {},
        react: { cache: (fn) => fn },
        'next/headers': {
          headers: async () => new Headers({ 'user-agent': ua, cookie: 'private' }),
        },
        '@/entities/community/api/community.api': { mapCommunityPostDetail: (value) => value },
      },
      {
        process: { env: { NEXT_PUBLIC_API_BASE_URL: 'https://api.test' } },
        fetch: async (url, options) => {
          calls.push(options)
          return Response.json({
            success: true,
            data: { visibility: 'public', status: 'published' },
          })
        },
      },
    )
    assert.ok(await api.getPublicCommunityPost(id))
    assert.equal(calls[0].credentials, 'omit')
    assert.equal(calls[0].cache, 'no-store')
    assert.equal(Boolean(calls[0].headers), ua !== 'Browser')
    assert.doesNotMatch(JSON.stringify(calls), /cookie|private/)
  }
})

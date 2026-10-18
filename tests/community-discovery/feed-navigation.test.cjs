const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')
const {
  parseCommunityFeedNavigation,
  communityFeedHref,
  communityWriteEntry,
  COMMUNITY_SEARCH_MAX_LENGTH,
} = load('src/entities/community/model/feed-navigation.ts', {
  './discovery': load('src/entities/community/model/discovery.ts'),
})
const { initialCommunityExperience } = load('src/entities/community/model/communityRecords.ts')

test('검색어와 동물 종류와 정렬 및 복합 조건을 주소에서 함께 복원한다', () => {
  const navigation = parseCommunityFeedNavigation(
    new URLSearchParams(
      'petType=dog&sort=popular&search=공원&topics=walk,park&topicMatch=all&tags=노령견&media=map',
    ),
  )
  assert.deepEqual(navigation, {
    petType: 'dog',
    sort: 'popular',
    search: '공원',
    discovery: { topics: ['walk', 'park'], topicMatch: 'all', tags: ['노령견'], media: 'map' },
  })
  assert.deepEqual(
    parseCommunityFeedNavigation(
      new URL(communityFeedHref(navigation), 'https://example.invalid').searchParams,
    ),
    navigation,
  )
})

test('필터만 수정해도 검색어와 동물 종류와 정렬은 유지한다', () => {
  const before = parseCommunityFeedNavigation(
    new URLSearchParams('petType=cat&sort=popular&search=공원&topics=walk'),
  )
  const url = new URL(
    communityFeedHref({ ...before, discovery: { tags: ['노령묘'] } }),
    'https://example.invalid',
  )
  assert.equal(url.searchParams.get('petType'), 'cat')
  assert.equal(url.searchParams.get('sort'), 'popular')
  assert.equal(url.searchParams.get('search'), '공원')
  assert.equal(url.searchParams.get('topics'), null)
  assert.equal(url.searchParams.get('tags'), '노령묘')
})

test('검색만 해제하면 고른 필터와 동물 종류를 유지한다', () => {
  const before = parseCommunityFeedNavigation(
    new URLSearchParams('petType=dog&search=산책&record=walk'),
  )
  assert.equal(communityFeedHref({ ...before, search: '' }), '/community?record=walk&petType=dog')
})

test('모르는 탐색 값과 비어 있는 기본 조건은 주소에서 제거한다', () => {
  const value = parseCommunityFeedNavigation(
    new URLSearchParams(
      'petType=unknown&sort=unknown&search=%20%20&topics=invalid&next=https://example.invalid',
    ),
  )
  assert.deepEqual(value, { petType: '', sort: 'latest', search: '', discovery: {} })
  assert.equal(communityFeedHref(value), '/community')
})

test('검색어는 서버 계약의 길이를 지키고 특수 문자는 쿼리 값으로만 인코딩한다', () => {
  const value = parseCommunityFeedNavigation(new URLSearchParams({ search: '가'.repeat(60) }))
  assert.equal(value.search.length, COMMUNITY_SEARCH_MAX_LENGTH)
  const href = communityFeedHref({ ...value, search: '공원 &sort=popular #산책' })
  const url = new URL(href, 'https://example.invalid')
  assert.equal(url.searchParams.size, 1)
  assert.equal(url.searchParams.get('search'), '공원 &sort=popular #산책')
  assert.equal(url.hash, '')
})

test('산책과 진료와 일상 작성 링크는 실제 제공하는 입력 틀로 연결한다', () => {
  for (const [record, expected] of [
    ['walk', 'walk'],
    ['clinic', 'clinic'],
    ['life', 'life'],
  ]) {
    const entry = communityWriteEntry({ record })
    const key = new URL(entry.href, 'https://example.invalid').searchParams.get('experience')
    const initial = initialCommunityExperience(key, '2026-10-08')
    assert.ok(initial[expected])
  }
})

test('질문과 장소 탐색은 해당 글감으로 연결하고 걷지 않은 장소를 산책 기록으로 강제하지 않는다', () => {
  const question = communityWriteEntry({ kind: 'question' })
  assert.equal(
    initialCommunityExperience(
      new URL(question.href, 'https://example.invalid').searchParams.get('experience'),
    ).question,
    true,
  )
  const place = communityWriteEntry({ media: 'map' })
  const initial = initialCommunityExperience(
    new URL(place.href, 'https://example.invalid').searchParams.get('experience'),
  )
  assert.equal(initial.walk, undefined)
  assert.ok(initial.topics.includes('travel'))
  assert.equal(communityWriteEntry({}).href, '/community/write')
})

test('작성 주소의 예상하지 않은 키로 입력 틀을 만들지 않는다', () => {
  assert.equal(initialCommunityExperience('constructor'), undefined)
  assert.equal(initialCommunityExperience('https://example.invalid'), undefined)
})

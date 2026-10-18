const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript: load } = require('../helpers/load-typescript.cjs')

const discovery = load('src/entities/community/model/discovery.ts')
const categories = load('src/app/(main)/community/_ui/discovery/categories.ts', {
  '@/entities/community': { countCommunityDiscovery: discovery.countCommunityDiscovery },
})
const { COMMUNITY_CATEGORIES } = categories

test('카테고리는 서버가 받는 주제 수(5개) 안에서 묶이고 서로 겹치지 않음', () => {
  const topics = COMMUNITY_CATEGORIES.flatMap((category) => category.topics ?? [])
  assert.equal(new Set(topics).size, topics.length)
  for (const category of COMMUNITY_CATEGORIES)
    assert.ok((category.topics?.length ?? 0) <= 5, category.label)
  // 질문은 주제가 아니라 글 성격으로 거른다
  assert.deepEqual(
    COMMUNITY_CATEGORIES.find((category) => category.key === 'question'),
    { key: 'question', label: '질문', icon: 'question', kind: 'question' },
  )
})

test('카테고리 → 말머리 → 전체 순으로 고르면 바깥 세부 조건은 그대로 남음', () => {
  const detail = { record: 'clinic', tags: ['노령견'], period: 'week' }
  const clinic = categories.withCategory(detail, 'clinic')
  assert.deepEqual(clinic.topics, [
    'clinic',
    'emergency',
    'vaccination',
    'checkup',
    'rehabilitation',
  ])
  assert.equal(categories.categoryOf(clinic).key, 'clinic')
  assert.equal(categories.subTopicOf(clinic), undefined)
  // 말머리 줄은 주제가 2개 이상인 카테고리에만 열린다 (질문·AI 사진은 없음)
  assert.deepEqual(categories.subTopicsOf(clinic), clinic.topics)
  assert.equal(categories.subTopicsOf({ kind: 'question' }), undefined)
  assert.equal(categories.subTopicsOf({ topics: ['ai-photo'] }), undefined)

  const vaccine = categories.withSubTopic(clinic, 'vaccination')
  assert.deepEqual(vaccine.topics, ['vaccination'])
  assert.equal(categories.categoryOf(vaccine).key, 'clinic')
  assert.equal(categories.subTopicOf(vaccine), 'vaccination')
  // 말머리 '전체'는 카테고리 전체 주제로 돌아간다
  assert.deepEqual(categories.withSubTopic(vaccine).topics, clinic.topics)

  const question = categories.withCategory(vaccine, 'question')
  assert.equal(question.topics, undefined)
  assert.equal(question.kind, 'question')
  assert.equal(categories.categoryOf(question).key, 'question')

  const all = categories.withCategory(question)
  assert.equal(all.topics, undefined)
  assert.equal(all.kind, undefined)
  assert.deepEqual({ record: all.record, tags: all.tags, period: all.period }, detail)
})

test('필터 숫자·초기화는 세부 조건만 다루고, 카테고리로 묶이지 않는 주제는 세부 조건으로 셈', () => {
  const value = { topics: ['dental'], record: 'walk', media: 'map' }
  assert.equal(categories.countDetailFilters(value), 2)
  assert.deepEqual(categories.keepCategory(value), { topics: ['dental'] })
  assert.deepEqual(categories.keepCategory({ kind: 'question', tags: ['x'] }), { kind: 'question' })
  // 여러 카테고리에 걸친 예전 링크·'질문·답변' 주제는 카테고리가 아니다
  const mixed = { topics: ['walk', 'dental'] }
  assert.equal(categories.categoryOf(mixed), undefined)
  assert.equal(categories.countDetailFilters(mixed), 2)
  assert.equal(categories.categoryOf({ topics: ['question'] }), undefined)
  assert.equal(categories.countDetailFilters({ kind: 'story' }), 1)
})

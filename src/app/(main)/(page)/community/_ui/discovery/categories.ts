import { countCommunityDiscovery, type CommunityPixelIconName } from '@/entities/community'
import type { CommunityDiscoveryFilters } from '@/shared/types'

/**
 * 커뮤니티 카테고리(대분류)와 말머리(소분류).
 *
 * 글에는 관심 주제가 여러 개(최대 3개) 붙는다. 둘러보기에서는 이를 게시판처럼 묶어
 * 카테고리 하나 → 그 안의 말머리 하나로 고르게 한다 (펨코 게시판·말머리, 당근 주제 칩).
 * 카테고리는 묶인 주제 중 하나라도 달린 글, 말머리는 그 주제가 달린 글이다.
 * 서버는 주제를 한 번에 5개까지 받으므로 카테고리 하나에 주제를 5개 넘게 묶지 않는다.
 * 질문은 주제가 아니라 글 성격(kind)이라 질문 카테고리만 kind 로 거른다.
 */
export interface CommunityCategory {
  key: string
  label: string
  icon: CommunityPixelIconName
  topics?: readonly string[]
  kind?: 'question'
}

export const COMMUNITY_CATEGORIES: readonly CommunityCategory[] = [
  { key: 'outing', label: '산책·나들이', icon: 'walk', topics: ['walk', 'park', 'travel', 'cafe'] },
  {
    key: 'clinic',
    label: '병원·진료',
    icon: 'clinic',
    topics: ['clinic', 'emergency', 'vaccination', 'checkup', 'rehabilitation'],
  },
  {
    key: 'health',
    label: '건강 관리',
    icon: 'heart',
    topics: ['dental', 'skin', 'senior', 'nutrition', 'allergy'],
  },
  {
    key: 'daily',
    label: '일상·훈련',
    icon: 'life',
    topics: ['daily', 'training', 'socialization'],
  },
  {
    key: 'care',
    label: '돌봄·용품',
    icon: 'bone',
    topics: ['grooming', 'supplies', 'insurance', 'habitat', 'reptile-care'],
  },
  {
    key: 'family',
    label: '입양·구조',
    icon: 'tag',
    topics: ['adoption', 'rescue', 'lost', 'memorial'],
  },
  { key: 'question', label: '질문', icon: 'question', kind: 'question' },
  { key: 'ai', label: 'AI 사진', icon: 'spark', topics: ['ai-photo'] },
]

const byKey = (key?: string) => COMMUNITY_CATEGORIES.find((category) => category.key === key)

/** 지금 고른 카테고리 — 주제가 한 카테고리 안에 다 들어갈 때만 카테고리로 본다 */
export const categoryOf = (value: CommunityDiscoveryFilters): CommunityCategory | undefined => {
  if (value.kind === 'question') return byKey('question')
  const topics = value.topics ?? []
  if (!topics.length) return undefined
  return COMMUNITY_CATEGORIES.find((category) =>
    topics.every((topic) => category.topics?.includes(topic)),
  )
}

// [refactored] '말머리가 있는 카테고리인지'(주제 2개 이상) 판단을 한 곳으로 — 말머리 줄·선택 판정이 함께 쓴다
/** 고른 카테고리의 말머리 목록 — 주제가 하나뿐이거나(질문·AI 사진) 카테고리가 없으면 undefined */
export const subTopicsOf = (value: CommunityDiscoveryFilters): readonly string[] | undefined => {
  const topics = categoryOf(value)?.topics
  return topics && topics.length > 1 ? topics : undefined
}

/** 지금 고른 말머리 — 카테고리 안에서 주제 하나만 골랐을 때 */
export const subTopicOf = (value: CommunityDiscoveryFilters): string | undefined => {
  const topics = value.topics ?? []
  return subTopicsOf(value) && topics.length === 1 ? topics[0] : undefined
}

/** 카테고리를 고르면 말머리는 '전체'로 돌아간다. 카테고리 밖 조건(기록·태그·자료·시기)은 그대로 둔다 */
export const withCategory = (
  value: CommunityDiscoveryFilters,
  key?: string,
): CommunityDiscoveryFilters => {
  const category = byKey(key)
  return {
    ...value,
    topics: category?.topics ? [...category.topics] : undefined,
    topicMatch: undefined,
    // 예전 링크의 '경험·후기'는 질문 카테고리를 고를 때만 덮는다
    kind: category?.kind ?? (value.kind === 'question' ? undefined : value.kind),
  }
}

export const withSubTopic = (
  value: CommunityDiscoveryFilters,
  topic?: string,
): CommunityDiscoveryFilters =>
  topic
    ? { ...value, topics: [topic], topicMatch: undefined }
    : withCategory(value, categoryOf(value)?.key)

/** 카테고리·말머리만 남긴 값 — 상세 필터를 초기화해도 위에서 고른 카테고리는 그대로 둔다 */
export const keepCategory = (value: CommunityDiscoveryFilters): CommunityDiscoveryFilters => {
  const category = categoryOf(value)
  if (!category) return {}
  return category.kind ? { kind: category.kind } : { topics: value.topics }
}

/** 상세 필터(세부 조건) 개수 — 카테고리·말머리는 위 줄에 이미 보이므로 세지 않는다 */
export const countDetailFilters = (value: CommunityDiscoveryFilters): number => {
  const inCategory = Boolean(categoryOf(value))
  return countCommunityDiscovery({
    ...value,
    topics: inCategory ? undefined : value.topics,
    topicMatch: inCategory ? undefined : value.topicMatch,
    kind: value.kind === 'question' ? undefined : value.kind,
  })
}

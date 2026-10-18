import type { CommunityDiscoveryFilters } from '@/shared/types'

export const COMMUNITY_TOPIC_GROUPS = [
  { title: '밖에서 함께', keys: ['walk', 'park', 'travel', 'cafe'] },
  {
    title: '건강과 진료',
    keys: [
      'clinic',
      'emergency',
      'vaccination',
      'checkup',
      'dental',
      'skin',
      'rehabilitation',
      'senior',
      'nutrition',
      'allergy',
    ],
  },
  {
    title: '생활과 돌봄',
    keys: [
      'daily',
      'training',
      'socialization',
      'grooming',
      'supplies',
      'insurance',
      'habitat',
      'reptile-care',
    ],
  },
  { title: '만남과 기억', keys: ['adoption', 'rescue', 'lost', 'memorial'] },
  { title: '질문과 창작', keys: ['question', 'ai-photo'] },
] as const

export function normalizeCommunityTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.normalize('NFC').trim().replace(/^#/, '').toLowerCase())
        .filter((tag) => /^[\p{L}\p{N}][\p{L}\p{N} _-]{0,19}$/u.test(tag)),
    ),
  ].slice(0, 5)
}

const TAG_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _-]{0,19}$/u

/** 입력 한 건을 저장 형식의 태그로 바꾼다. 쓸 수 없는 값이면 null. */
export function toCommunityTag(value: string): string | null {
  const tag = value.normalize('NFC').trim().replace(/^#/, '').trim().toLowerCase()
  return TAG_PATTERN.test(tag) ? tag : null
}

const KINDS = ['question', 'story'] as const
const MEDIA = ['photos', 'map'] as const
const PERIODS = ['week', 'month'] as const
const RECORDS = ['walk', 'clinic', 'life'] as const
const TOPIC_KEYS: readonly string[] = COMMUNITY_TOPIC_GROUPS.flatMap((group) => group.keys)
export const COMMUNITY_MAX_FILTER_TOPICS = 5

const pick = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((item) => item === value)

/** 주소의 필터를 읽는다. 모르는 값은 버려 잘못된 링크가 빈 목록을 만들지 않게 한다. */
export function parseCommunityDiscovery(parameters: {
  get: (name: string) => string | null
}): CommunityDiscoveryFilters {
  const topics = [
    ...new Set(
      (parameters.get('topics') ?? '')
        .split(',')
        .map((topic) => topic.trim())
        .filter((topic) => TOPIC_KEYS.includes(topic)),
    ),
  ].slice(0, COMMUNITY_MAX_FILTER_TOPICS)
  const tags = normalizeCommunityTags(parameters.get('tags') ?? '')
  const kind = pick(KINDS, parameters.get('kind'))
  const media = pick(MEDIA, parameters.get('media'))
  const period = pick(PERIODS, parameters.get('period'))
  const record = pick(RECORDS, parameters.get('record'))
  return {
    ...(topics.length ? { topics } : {}),
    ...(topics.length > 1 && parameters.get('topicMatch') === 'all'
      ? { topicMatch: 'all' as const }
      : {}),
    ...(tags.length ? { tags } : {}),
    ...(kind ? { kind } : {}),
    ...(media ? { media } : {}),
    ...(period ? { period } : {}),
    ...(record ? { record } : {}),
  }
}

/** 필터를 주소 쿼리로 바꾼다. 빈 필터는 빈 문자열. */
export function toCommunityDiscoveryQuery(filters: CommunityDiscoveryFilters): string {
  const query = new URLSearchParams()
  if (filters.topics?.length) query.set('topics', filters.topics.join(','))
  if (filters.topicMatch === 'all' && (filters.topics?.length ?? 0) > 1)
    query.set('topicMatch', 'all')
  if (filters.tags?.length) query.set('tags', filters.tags.join(','))
  if (filters.kind) query.set('kind', filters.kind)
  if (filters.media) query.set('media', filters.media)
  if (filters.period) query.set('period', filters.period)
  if (filters.record) query.set('record', filters.record)
  return query.toString()
}

export function countCommunityDiscovery(filters: CommunityDiscoveryFilters): number {
  return (
    (filters.topics?.length ?? 0) +
    (filters.tags?.length ?? 0) +
    Number(!!filters.kind) +
    Number(!!filters.media) +
    Number(!!filters.period) +
    Number(!!filters.record)
  )
}

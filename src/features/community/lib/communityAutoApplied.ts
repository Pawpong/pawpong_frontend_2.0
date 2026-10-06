import type { CommunityExperience } from '@/shared/types'

export interface CommunityAutoApplied {
  topics: string[]
  tags: string[]
}

const key = (postId: string) => `pawpong:community:auto-applied:${postId}`

/** 내가 보낸 것과 저장된 것의 차이 = 서버가 자동으로 붙인 주제·태그 */
export function diffCommunityAutoApplied(
  submitted: CommunityExperience | null | undefined,
  saved: CommunityExperience | null | undefined,
): CommunityAutoApplied {
  const sentTopics = new Set(submitted?.topics ?? [])
  const sentTags = new Set(submitted?.tags ?? [])
  return {
    topics: (saved?.topics ?? []).filter((topic) => !sentTopics.has(topic)),
    tags: (saved?.tags ?? []).filter((tag) => !sentTags.has(tag)),
  }
}

/**
 * 방금 올린 글에서 무엇이 자동으로 붙었는지 이 탭에만 적어 둔다.
 * 서버 응답은 누가 붙였는지 구분하지 않으므로, 작성 직후 상세 화면의 안내에만 쓴다.
 */
export function rememberCommunityAutoApplied(postId: string, applied: CommunityAutoApplied): void {
  try {
    if (applied.topics.length || applied.tags.length)
      sessionStorage.setItem(key(postId), JSON.stringify(applied))
    else sessionStorage.removeItem(key(postId))
  } catch {
    // 저장소를 못 쓰면 안내만 생략한다.
  }
}

export function readCommunityAutoApplied(postId: string): CommunityAutoApplied | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key(postId)) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const { topics, tags } = value as Record<string, unknown>
    const strings = (list: unknown) =>
      Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []
    return { topics: strings(topics), tags: strings(tags) }
  } catch {
    return null
  }
}

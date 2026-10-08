import type { CommunityDiscoveryFilters, CommunityPetType, CommunitySortType } from '@/shared/types'
import { parseCommunityDiscovery, toCommunityDiscoveryQuery } from './discovery'

export interface CommunityFeedNavigation {
  discovery: CommunityDiscoveryFilters
  petType: CommunityPetType | ''
  sort: CommunitySortType
  search: string
}

export const COMMUNITY_SEARCH_MAX_LENGTH = 50

export function parseCommunityFeedNavigation(parameters: {
  get: (key: string) => string | null
}): CommunityFeedNavigation {
  const pet = parameters.get('petType')
  return {
    discovery: parseCommunityDiscovery(parameters),
    petType: pet === 'dog' || pet === 'cat' || pet === 'reptile' ? pet : '',
    sort: parameters.get('sort') === 'popular' ? 'popular' : 'latest',
    search: (parameters.get('search') ?? '').trim().slice(0, COMMUNITY_SEARCH_MAX_LENGTH),
  }
}

export function communityFeedHref(value: CommunityFeedNavigation): string {
  const query = new URLSearchParams(toCommunityDiscoveryQuery(value.discovery))
  if (value.petType) query.set('petType', value.petType)
  if (value.sort !== 'latest') query.set('sort', value.sort)
  if (value.search.trim())
    query.set('search', value.search.trim().slice(0, COMMUNITY_SEARCH_MAX_LENGTH))
  return query.size ? `/community?${query}` : '/community'
}

export function communityWriteEntry(filters: CommunityDiscoveryFilters): {
  href: string
  label: string
} {
  if (filters.record === 'clinic')
    return { href: '/community/write?experience=clinic', label: '병원 방문 기록하기' }
  if (filters.record === 'life')
    return { href: '/community/write?experience=daily', label: '오늘의 일상 남기기' }
  if (filters.record === 'walk')
    return { href: '/community/write?experience=walk', label: '산책 기록 남기기' }
  if (filters.kind === 'question')
    return { href: '/community/write?experience=question', label: '궁금한 점 물어보기' }
  if (filters.media === 'map')
    return { href: '/community/write?experience=travel', label: '다녀온 장소 공유하기' }
  return { href: '/community/write', label: '이야기 쓰기' }
}

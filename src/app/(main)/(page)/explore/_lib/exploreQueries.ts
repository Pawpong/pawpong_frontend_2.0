import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { breederQueries } from '@/entities/breeder'
import { getTotalItems } from '@/shared/lib/infiniteList'
import { CATEGORY_TO_PET_TYPE } from '@/shared/lib/petCategory'
import { REGION_GROUPS } from './constants'
import type { ExploreQuery } from './useExploreQuery'

// 인기순 → 찜 많은 순 (브리더 탐색 API 에는 popular 대신 favorite 이 있다)
const SORT_TO_BREEDER_SORT = { popular: 'favorite', latest: 'latest' } as const

/** 탐색 조건 → 목록 조회 조건. 목록과 필터의 'N명 보기' 버튼이 같은 키를 써서 요청은 한 번만 간다 */
export const breederExploreQuery = (query: ExploreQuery) =>
  breederQueries.explore({
    petType: CATEGORY_TO_PET_TYPE[query.category],
    keyword: query.keyword || undefined,
    sortBy: SORT_TO_BREEDER_SORT[query.sort],
    isAdoptionAvailable: query.status === 'available' || undefined,
    province: REGION_GROUPS.find((group) => group.value === query.region)?.provinces.slice(),
  })

export const adoptionExploreQuery = (query: ExploreQuery) =>
  adoptionQueries.list(
    query.sort,
    CATEGORY_TO_PET_TYPE[query.category],
    query.status === 'all' ? undefined : query.status,
    query.keyword || undefined,
  )

/** 지금 조건에 걸린 전체 개수 (첫 페이지 응답 기준) */
export const useExploreTotal = (query: ExploreQuery) => {
  const breeders = useInfiniteQuery({
    ...breederExploreQuery(query),
    enabled: query.type === 'breeder',
  })
  const listings = useInfiniteQuery({
    ...adoptionExploreQuery(query),
    enabled: query.type === 'adoption',
  })
  return query.type === 'breeder' ? getTotalItems(breeders.data) : getTotalItems(listings.data)
}

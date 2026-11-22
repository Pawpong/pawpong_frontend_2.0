import type { TabBarItem } from '@/shared/ui'
import type { AdoptionSortType } from '@/shared/types'

export type ExploreType = 'adoption' | 'breeder'
export type ExploreStatus = 'all' | 'available' | 'reserved'

// 목록 섹션 위아래 간격 — 세로 mo 20px(spacing/20)→tab+ 40px(spacing/40). 좌우는 페이지 틀이 정한다.
// (그리드/featured 레이아웃 클래스는 단일 소비자인 ExploreListingSection 로컬 상수로 이동)
export const EXPLORE_SECTION_CONTAINER = 'pt-3.5 pb-5 tab:pb-10'

export const EXPLORE_TABS: ReadonlyArray<TabBarItem & { value: ExploreType }> = [
  { value: 'breeder', label: '브리더 탐색' },
  { value: 'adoption', label: '입양 탐색' },
]

// 분양 상태 — 브리더 탐색 API 는 '분양 가능' 하나만 거를 수 있어 예약중이 없다
export const STATUS_OPTIONS: Record<
  ExploreType,
  ReadonlyArray<{ value: ExploreStatus; label: string }>
> = {
  adoption: [
    { value: 'all', label: '전체' },
    { value: 'available', label: '분양중' },
    { value: 'reserved', label: '예약중' },
  ],
  breeder: [
    { value: 'all', label: '전체' },
    { value: 'available', label: '분양중' },
  ],
}

export const SORT_OPTIONS: ReadonlyArray<{ value: AdoptionSortType; label: string }> = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
]

/** 지역 미선택 — 그 외에는 지역 API 의 시·도 이름(예: 경기도)을 그대로 쓴다 */
export const ALL_REGIONS = 'all'

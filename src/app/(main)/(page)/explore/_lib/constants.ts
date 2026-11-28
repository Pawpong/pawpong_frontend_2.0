import type { TabBarItem } from '@/shared/ui'
import type { AdoptionSortType, AnimalCategory } from '@/shared/types'

export type ExploreType = 'adoption' | 'breeder'
export type ExploreStatus = 'all' | 'available' | 'reserved'

// 목록 섹션 위아래 간격 — 세로 mo 20px(spacing/20)→tab+ 40px(spacing/40). 좌우는 페이지 틀이 정한다.
// (그리드/featured 레이아웃 클래스는 단일 소비자인 ExploreListingSection 로컬 상수로 이동)
export const EXPLORE_SECTION_CONTAINER = 'pt-3.5 pb-5 tab:pb-10'

// PC 는 왼쪽 필터 칸만큼 목록이 좁아져 공통 5열 대신 3열(1024) → 4열(1440)로 둔다
export const EXPLORE_GRID = 'lap:grid-cols-3 pc:grid-cols-4'

export const EXPLORE_TABS: ReadonlyArray<TabBarItem & { value: ExploreType }> = [
  { value: 'breeder', label: '브리더 탐색' },
  { value: 'adoption', label: '입양 탐색' },
]

// 분양 상태 — 브리더 탐색 API 는 '분양 가능' 하나만 거를 수 있어 예약중이 없다 (브리더는 스위치 하나로 고른다)
export const ADOPTION_STATUS_OPTIONS: ReadonlyArray<{ value: ExploreStatus; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'available', label: '분양중' },
  { value: 'reserved', label: '예약중' },
]

export const SORT_OPTIONS: ReadonlyArray<{ value: AdoptionSortType; label: string }> = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '최신순' },
]

// 동물 종류 앞 얼굴 그림 — 커뮤니티 동물 목록과 같은 그림, '전체'는 탐색의 발바닥
export const CATEGORY_ICON: Record<AnimalCategory, string> = {
  all: '/images/category/cta-paw.svg',
  cat: '/images/community/face-cat.png',
  dog: '/images/community/face-dog.png',
  lizard: '/images/community/face-lizard.png',
}

export const ALL_REGIONS = 'all'

// 지역은 시·도 묶음으로 고른다 — 탐색 API 가 시·도 여러 개(province 배열)를 한 번에 받는다.
// 이름은 지역 API(/districts)의 시·도 이름과 같아야 걸린다.
export const REGION_GROUPS = [
  { value: 'capital', label: '서울·경기·인천', provinces: ['서울특별시', '경기도', '인천광역시'] },
  {
    value: 'central',
    label: '충청·강원',
    provinces: ['대전광역시', '세종특별자치시', '충청북도', '충청남도', '강원도'],
  },
  {
    value: 'south',
    label: '영남·호남·제주',
    provinces: [
      '부산광역시',
      '대구광역시',
      '울산광역시',
      '경상북도',
      '경상남도',
      '광주광역시',
      '전라북도',
      '전라남도',
      '제주특별자치도',
    ],
  },
] as const

export type ExploreRegion = typeof ALL_REGIONS | (typeof REGION_GROUPS)[number]['value']

export const REGION_OPTIONS: ReadonlyArray<{ value: ExploreRegion; label: string }> = [
  { value: ALL_REGIONS, label: '전체 지역' },
  ...REGION_GROUPS,
]

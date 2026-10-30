export type ExploreType = 'adoption' | 'breeder'

// 목록 섹션 위아래 간격 — 세로 mo 20px(spacing/20)→tab+ 40px(spacing/40). 좌우는 페이지 틀이 정한다.
// (그리드/featured 레이아웃 클래스는 단일 소비자인 ExploreListingSection 로컬 상수로 이동)
export const EXPLORE_SECTION_CONTAINER = 'py-5 tab:py-10'

export const EXPLORE_TABS: Array<{ type: ExploreType; label: string }> = [
  { type: 'breeder', label: '브리더 탐색' },
  { type: 'adoption', label: '입양 탐색' },
]

export const SEARCH_PLACEHOLDERS: Record<ExploreType, { mobile: string; desktop: string }> = {
  adoption: {
    mobile: '검색해서 원하는 동물 찾기',
    desktop: '검색해서 원하는 아이 찾기',
  },
  breeder: {
    // 검색어 하나로 브리더 이름·품종·지역(시/도·시/군구)을 함께 찾는다 (백엔드 breeder-explore-criteria)
    mobile: '브리더·품종·지역으로 검색',
    desktop: '브리더를 통해 알고싶은게 있나요?',
  },
}

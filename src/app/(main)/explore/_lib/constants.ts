export type ExploreType = 'adoption' | 'breeder'

export const EXPLORE_TABS: Array<{ type: ExploreType; label: string }> = [
  { type: 'adoption', label: '입양 탐색' },
  { type: 'breeder', label: '브리더 탐색' },
]

export const SEARCH_PLACEHOLDERS: Record<
  ExploreType,
  { mobile: string; desktop: string }
> = {
  adoption: {
    mobile: '검색해서 원하는 동물 찾기',
    desktop: '검색해서 원하는 아이 찾기',
  },
  breeder: {
    mobile: '아무거나 검색해보세요',
    desktop: '브리더를 통해 알고싶은게 있나요?',
  },
}

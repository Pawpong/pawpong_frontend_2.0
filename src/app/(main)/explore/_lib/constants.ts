import { textLabelVariants } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

export type ExploreType = 'adoption' | 'breeder'

// 섹션 제목 클래스: 공통 TextLabel(p-2px, #3e3e3e, 600) + 반응형 토큰 text-body-s(mo 14 / tab+ 16)
// tab:/pc: 변형은 SectionHeader 기본 램프(tab:text-base pc:text-xl) 무력화용
export const EXPLORE_SECTION_TITLE_CLASS = cn(
  textLabelVariants(),
  'text-body-s tab:text-body-s pc:text-body-s',
)

// [refactored] 섹션 Container 공통 패딩 — 세로 mo 20px(spacing/20)→tab+ 40px(spacing/40), 가로 mo 16px(margin/mo)/tab 48/pc 80
// (그리드/featured 레이아웃 클래스는 단일 소비자인 ExploreListingSection 로컬 상수로 이동)
export const EXPLORE_SECTION_CONTAINER = 'px-4 py-5 tab:py-10'

export const EXPLORE_TABS: Array<{ type: ExploreType; label: string }> = [
  { type: 'adoption', label: '입양 탐색' },
  { type: 'breeder', label: '브리더 탐색' },
]

export const SEARCH_PLACEHOLDERS: Record<ExploreType, { mobile: string; desktop: string }> = {
  adoption: {
    mobile: '검색해서 원하는 동물 찾기',
    desktop: '검색해서 원하는 아이 찾기',
  },
  breeder: {
    mobile: '아무거나 검색해보세요',
    desktop: '브리더를 통해 알고싶은게 있나요?',
  },
}

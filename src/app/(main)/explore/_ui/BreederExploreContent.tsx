import { cn } from '@/shared/lib/cn'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { BreederCardHorizontal } from './BreederCardHorizontal'
import { CollapsibleSection } from './CollapsibleSection'
import { MOCK_FEATURED_BREEDERS, MOCK_EXPLORE_BREEDERS } from '@/shared/mocks/breederExplore'

// [refactored] 반복 섹션/그리드 className 상수화
const SECTION_CLASS = 'tab:mt-[4rem] tab:gap-[1.25rem]'
const BREEDER_GRID = 'tab:grid tab:grid-cols-3 tab:gap-[1.156rem]'

// 상단 카테고리/검색(PC 픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더
const BreederExploreContent = () => {
  return (
    <>
      {/* 주목할 브리더 — 모바일 가로형 / 데스크탑 3열 */}
      {/* [refactored] CollapsibleSection으로 헤더+collapse 위임 */}
      <CollapsibleSection
        title={`주목할 브리더 ${MOCK_FEATURED_BREEDERS.length}`}
        className={cn('mt-[2.063rem]', SECTION_CLASS)}
      >
        <div className="flex flex-col gap-[0.75rem] tab:hidden">
          {MOCK_FEATURED_BREEDERS.map((breeder) => (
            <BreederCardHorizontal key={breeder.id} breeder={breeder} />
          ))}
        </div>
        <div className={cn('hidden', BREEDER_GRID)}>
          {MOCK_FEATURED_BREEDERS.map((breeder) => (
            <BreederCard key={breeder.id} breeder={breeder} showPopularBadge />
          ))}
        </div>
      </CollapsibleSection>

      {/* 전체 입양 소식 — 모바일 2열 / 데스크탑 3열 */}
      <CollapsibleSection
        title={`전체 입양 소식 ${MOCK_EXPLORE_BREEDERS.length}`}
        className={cn('mt-[1.25rem]', SECTION_CLASS)}
      >
        <div className={cn('grid grid-cols-2 gap-[0.97rem]', BREEDER_GRID)}>
          {MOCK_EXPLORE_BREEDERS.map((breeder) => (
            <BreederCard key={breeder.id} breeder={breeder} />
          ))}
        </div>
      </CollapsibleSection>

      {/* 하단 여백 */}
      <div className="h-[4rem]" />
    </>
  )
}

export { BreederExploreContent }

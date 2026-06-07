import { SearchSection } from '@/features/search'
import { cn } from '@/shared/lib/cn'
import { SEARCH_PLACEHOLDERS } from '../_lib/constants'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { BreederCardHorizontal } from './BreederCardHorizontal'
import { CollapsibleSection } from './CollapsibleSection'
import { MOCK_FEATURED_BREEDERS, MOCK_EXPLORE_BREEDERS } from '@/shared/mocks/breederExplore'

// [refactored] 반복 섹션/그리드 className 상수화
const SECTION_CLASS = 'tab:mt-[4rem] tab:gap-[1.25rem]'
const BREEDER_GRID = 'tab:grid tab:grid-cols-3 tab:gap-[1.156rem]'

const BreederExploreContent = () => {
  return (
    <>
      {/* 검색바 + 인기 검색어 — PC 전용 (탭/모바일은 상단 필터바의 검색 pill 사용) */}
      <SearchSection
        placeholder={SEARCH_PLACEHOLDERS.breeder}
        withPadding={false}
        className="hidden pc:mt-[2.188rem] pc:flex"
      />

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

import { Container, textLabelVariants } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { CollapsibleSection } from './CollapsibleSection'
import { MOCK_FEATURED_BREEDERS, MOCK_EXPLORE_BREEDERS } from '@/shared/mocks/breederExplore'

// 섹션 제목: 공통 TextLabel 스타일(Body/large/bold 16px·600·150%, 패딩 2px, #3E3E3E)
// tab:text-base는 SectionHeader 기본 tab:text-xl 오버라이드용
const SECTION_TITLE_CLASS = cn(textLabelVariants(), 'tab:text-base')

// 상단 카테고리/검색(PC 픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더
const BreederExploreContent = () => {
  return (
    <>
      {/* 인기 브리더 — 모바일 가로형 / 데스크탑 3열 */}
      {/* 공통 Container(가로 margin-pc 80) + 세로 spacing-40(40px) padding */}
      <Container className="py-[2.5rem]">
        <CollapsibleSection
          title={`인기 브리더 ${MOCK_FEATURED_BREEDERS.length}`}
          titleClassName={SECTION_TITLE_CLASS}
        >
          {/* 3개만 노출 + 가운데 정렬 (모바일 2열 / 데스크탑 3열, 마지막 카드 중앙) — 즐겨찾기 그리드 gap(20px) 동일 */}
          {/* 카드 레이아웃만 좌우 px (제목은 컨테이너 기준 유지) */}
          <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-4 tab:gap-5 pc:px-[12.328125rem]">
            {MOCK_FEATURED_BREEDERS.slice(0, 3).map((breeder) => (
              <div
                key={breeder.id}
                className="w-[calc(50%-0.3125rem)] tab:w-[calc((100%-2.5rem)/3)]"
              >
                <BreederCard breeder={breeder} showPopularBadge />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </Container>

      {/* 전체 브리더 소식 — 즐겨찾기 브리더 그리드와 동일 (모바일 2열 / 태블릿 3열 / PC 4열) */}
      <Container className="py-[2.5rem]">
        <CollapsibleSection
          title={`전체 브리더 소식 ${MOCK_EXPLORE_BREEDERS.length}`}
          titleClassName={SECTION_TITLE_CLASS}
        >
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 pb-[6.75rem] tab:grid-cols-3 tab:gap-5 pc:grid-cols-4 pc:px-[2.89625rem]">
            {MOCK_EXPLORE_BREEDERS.map((breeder) => (
              <BreederCard key={breeder.id} breeder={breeder} />
            ))}
          </div>
        </CollapsibleSection>
      </Container>
    </>
  )
}

export { BreederExploreContent }

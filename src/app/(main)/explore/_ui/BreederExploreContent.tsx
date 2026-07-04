import { Container } from '@/shared/ui'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { TitledSection } from './TitledSection'
import { FeaturedGrid } from './FeaturedGrid'
import { MOCK_FEATURED_BREEDERS, MOCK_EXPLORE_BREEDERS } from '@/shared/mocks/breederExplore'
import { EXPLORE_SECTION_TITLE_CLASS, EXPLORE_SECTION_CONTAINER } from '../_lib/constants'

// 상단 카테고리/검색(PC 픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더
const BreederExploreContent = () => {
  return (
    <>
      {/* 인기 브리더 — 모바일 가로형 / 데스크탑 3열 */}
      {/* [refactored] 섹션 패딩 공통 상수 */}
      <Container className={EXPLORE_SECTION_CONTAINER}>
        <TitledSection title="인기 브리더" titleClassName={EXPLORE_SECTION_TITLE_CLASS}>
          {/* 3개만 노출 + 가운데 정렬 (제목은 컨테이너 기준 유지, 카드 레이아웃만 좌우 px) */}
          <FeaturedGrid
            items={MOCK_FEATURED_BREEDERS}
            getKey={(breeder) => breeder.id}
            renderCard={(breeder) => <BreederCard breeder={breeder} showPopularBadge />}
          />
        </TitledSection>
      </Container>

      {/* 전체 브리더 소식 — 즐겨찾기 브리더 그리드와 동일 (모바일 2열 / 태블릿 3열 / PC 4열) */}
      <Container className={EXPLORE_SECTION_CONTAINER}>
        <TitledSection
          title={`전체 브리더 소식 ${MOCK_EXPLORE_BREEDERS.length}`}
          titleClassName={EXPLORE_SECTION_TITLE_CLASS}
        >
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 pb-[6.75rem] tab:grid-cols-3 tab:gap-5 pc:grid-cols-4 pc:px-[2.89625rem]">
            {MOCK_EXPLORE_BREEDERS.map((breeder) => (
              <BreederCard key={breeder.id} breeder={breeder} />
            ))}
          </div>
        </TitledSection>
      </Container>
    </>
  )
}

export { BreederExploreContent }

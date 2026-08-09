import { Container } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { ExploreListingSection } from './ExploreListingSection'
import { MOCK_FEATURED_BREEDERS, MOCK_EXPLORE_BREEDERS } from '@/shared/mocks/breederExplore'
import { EXPLORE_SECTION_CONTAINER } from '../_lib/constants'

// 상단 카테고리/검색(픽셀 카테고리 + 큰 검색바)은 ExploreContent에서 공통 렌더
// 브리더 카드 종류만 주입하고 섹션/그리드 레이아웃은 공용 컴포넌트에 위임
const BreederExploreContent = () => {
  return (
    <>
      {/* 인기 브리더 — 입양 탐색 인기 동물과 동일 (tab 가로 80px) */}
      <Container className={cn(EXPLORE_SECTION_CONTAINER, 'tab:px-20')}>
        <ExploreListingSection
          title="인기 브리더"
          items={MOCK_FEATURED_BREEDERS}
          getKey={(breeder) => breeder.id}
          renderCard={(breeder) => <BreederCard breeder={breeder} showPopularBadge />}
          variant="featured"
        />
      </Container>

      {/* 전체 브리더 소식 — 전체 입양 소식과 동일 그리드 */}
      <Container className={EXPLORE_SECTION_CONTAINER}>
        <ExploreListingSection
          title="전체 브리더 소식"
          items={MOCK_EXPLORE_BREEDERS}
          getKey={(breeder) => breeder.id}
          renderCard={(breeder) => <BreederCard breeder={breeder} />}
        />
      </Container>
    </>
  )
}

export { BreederExploreContent }

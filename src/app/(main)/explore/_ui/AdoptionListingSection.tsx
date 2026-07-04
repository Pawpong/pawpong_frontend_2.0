import { FavoriteAdoptionCard } from '@/features/adoption'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { TitledSection } from './TitledSection'
import { FeaturedGrid } from './FeaturedGrid'
import { EXPLORE_SECTION_TITLE_CLASS } from '../_lib/constants'

// [refactored] 섹션 래퍼/제목/collapse는 TitledSection이 담당, 여기선 카드 그리드만 정의
const SECTION_CLASS = 'tab:px-[2rem] pc:px-0' // tab 좌우 80px = Container 48 + 32, pc 리셋 (세로 간격은 Container py가 담당)
// mo 2열(유동) / tab 카드 고정 282px 2열 중앙(Figma 1596-92020) / pc 4열(유동), 좌우 46px
const CARD_GRID =
  'grid grid-cols-2 gap-[0.97rem] tab:grid-cols-[repeat(2,17.625rem)] tab:justify-center tab:gap-5 pc:mx-[2.875rem] pc:grid-cols-4'

interface AdoptionListingSectionProps {
  /** 섹션 라벨 (개수는 listings.length로 자동 부착) */
  title: string
  listings: AdoptionListingCard[]
  /** 섹션 상단 여백 등 추가 클래스 */
  className?: string
  /** featured: 인기 브리더처럼 3개 가운데 정렬(큰 좌우 px) / grid(기본): 2·3·4열 그리드 */
  variant?: 'featured' | 'grid'
}

const AdoptionListingSection = ({
  title,
  listings,
  className,
  variant = 'grid',
}: AdoptionListingSectionProps) => {
  if (variant === 'featured') {
    return (
      <TitledSection title={title} titleClassName={EXPLORE_SECTION_TITLE_CLASS} className={className}>
        <FeaturedGrid
          items={listings}
          getKey={(listing) => listing.listingId}
          renderCard={(listing) => <FavoriteAdoptionCard listing={listing} />}
        />
      </TitledSection>
    )
  }

  return (
    <TitledSection
      title={`${title} ${listings.length}`}
      titleClassName={EXPLORE_SECTION_TITLE_CLASS}
      className={cn(SECTION_CLASS, className)}
    >
      <div className={CARD_GRID}>
        {listings.map((listing) => (
          <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
        ))}
      </div>
    </TitledSection>
  )
}

export { AdoptionListingSection }

import { FavoriteAdoptionCard } from '@/features/adoption'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { CollapsibleSection } from './CollapsibleSection'

// [refactored] 섹션 래퍼/제목/collapse는 CollapsibleSection이 담당, 여기선 카드 그리드만 정의
const SECTION_CLASS = 'tab:mt-[2.5rem] tab:px-[2rem] pc:px-0' // tab 좌우 80px = Container 48 + 32, pc 리셋
const SECTION_TITLE = 'font-semibold text-[#3e3e3e] tab:text-base' // Figma body/large/bold #3e3e3e
// mo·tab 2열 / pc 4열, 그리드 좌우 margin: tab 12px / pc(4열) 46px
const CARD_GRID =
  'grid grid-cols-2 gap-[0.97rem] tab:mx-[0.75rem] tab:gap-[1.25rem] pc:mx-[2.875rem] pc:grid-cols-4'

interface AdoptionListingSectionProps {
  /** 섹션 라벨 (개수는 listings.length로 자동 부착) */
  title: string
  listings: AdoptionListingCard[]
  /** 섹션 상단 여백 등 추가 클래스 */
  className?: string
}

const AdoptionListingSection = ({ title, listings, className }: AdoptionListingSectionProps) => {
  return (
    <CollapsibleSection
      title={`${title} ${listings.length}`}
      titleClassName={SECTION_TITLE}
      className={cn(SECTION_CLASS, className)}
    >
      <div className={CARD_GRID}>
        {listings.map((listing) => (
          <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
        ))}
      </div>
    </CollapsibleSection>
  )
}

export { AdoptionListingSection }

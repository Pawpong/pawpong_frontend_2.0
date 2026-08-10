import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { ListingCardGrid } from '@/shared/ui'
import { TitledSection } from './TitledSection'
import { EXPLORE_SECTION_TITLE_CLASS } from '../_lib/constants'

// 브리더 탐색의 인기/전체 섹션 공용 — 카드 UI는 renderCard로 주입

// featured(인기) 그리드: mo 4개 2열x2줄 / tab 3개 고정 282px 2+1 / pc 3개 3열 + 좌우 px(197.25px)
const FEATURED_GRID =
  'flex flex-wrap justify-center gap-x-2.5 gap-y-4 tab:gap-5 tab:px-3 pc:px-[12.328125rem]'
const FEATURED_CARD = 'w-[calc(50%-0.3125rem)] tab:w-[17.625rem] pc:w-[calc((100%-2.5rem)/3)]'

interface ExploreListingSectionProps<T> {
  /** 섹션 라벨 (grid variant는 개수 자동 부착) */
  title: string
  items: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => ReactNode
  /** featured: 인기 섹션(모바일 4개 2x2, tab+ 3개 중앙) / grid(기본): 전체 소식 그리드 */
  variant?: 'featured' | 'grid'
  className?: string
  headerSlot?: ReactNode
  /** 필터링 전 전체 개수처럼 items.length와 다른 값을 제목에 표시할 때 사용 */
  totalCount?: number
}

const ExploreListingSection = <T,>({
  title,
  items,
  getKey,
  renderCard,
  variant = 'grid',
  className,
  headerSlot,
  totalCount,
}: ExploreListingSectionProps<T>) => {
  if (variant === 'featured') {
    return (
      <TitledSection
        title={title}
        titleClassName={EXPLORE_SECTION_TITLE_CLASS}
        className={className}
      >
        {/* 4번째 카드는 모바일 전용(tab+ 숨김) */}
        <div className={FEATURED_GRID}>
          {items.slice(0, 4).map((item, index) => (
            <div key={getKey(item)} className={cn(FEATURED_CARD, index === 3 && 'tab:hidden')}>
              {renderCard(item)}
            </div>
          ))}
        </div>
      </TitledSection>
    )
  }

  return (
    <TitledSection
      title={`${title} ${totalCount ?? items.length}`}
      titleClassName={EXPLORE_SECTION_TITLE_CLASS}
      className={className}
      headerSlot={headerSlot}
    >
      <ListingCardGrid items={items} getKey={getKey} renderItem={renderCard} />
    </TitledSection>
  )
}

export { ExploreListingSection }

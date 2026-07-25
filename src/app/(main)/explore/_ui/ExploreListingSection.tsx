import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { TitledSection } from './TitledSection'
import { EXPLORE_SECTION_TITLE_CLASS } from '../_lib/constants'

// [refactored] 입양/브리더 탭 공용 섹션 — 카드 UI는 renderCard로 주입 (AdoptionListingSection + FeaturedGrid 통합)

// grid(전체 소식) 섹션 래퍼: tab 좌우 80px = Container 48 + 32, pc 리셋
const GRID_SECTION_CLASS = 'tab:px-[2rem] pc:px-0'
// grid 카드: mo 2열(유동) / tab 카드 고정 282px 2열 중앙(Figma 1596-92020) / pc 4열(유동), 좌우 46px
const CARD_GRID =
  'grid grid-cols-2 gap-[0.97rem] tab:grid-cols-[repeat(2,17.625rem)] tab:justify-center tab:gap-5 pc:mx-[2.875rem] pc:grid-cols-4'
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
  /** grid variant 제목 옆 개수 — 무한스크롤 전체 건수(totalItems)용 (미지정 시 items.length) */
  count?: number
  className?: string
}

const ExploreListingSection = <T,>({
  title,
  items,
  getKey,
  renderCard,
  variant = 'grid',
  count,
  className,
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
      title={`${title} ${count ?? items.length}`}
      titleClassName={EXPLORE_SECTION_TITLE_CLASS}
      className={cn(GRID_SECTION_CLASS, className)}
    >
      <div className={CARD_GRID}>
        {items.map((item) => (
          <div key={getKey(item)}>{renderCard(item)}</div>
        ))}
      </div>
    </TitledSection>
  )
}

export { ExploreListingSection }

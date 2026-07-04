import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface FeaturedGridProps<T> {
  items: T[]
  getKey: (item: T) => string
  renderCard: (item: T) => ReactNode
}

// 인기(featured) 레이아웃 — 가운데 정렬
// 모바일: 4개 2열x2줄 / 태블릿: 3개, 카드 고정 282px(Figma) 2+1 / PC: 3개 3열 한 줄 + 좌우 px(197.25px)
// 4번째 카드는 모바일 전용(tab+ 숨김). 카드 UI는 renderCard로 주입
const FeaturedGrid = <T,>({ items, getKey, renderCard }: FeaturedGridProps<T>) => (
  <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-4 tab:gap-5 tab:px-3 pc:px-[12.328125rem]">
    {items.slice(0, 4).map((item, index) => (
      <div
        key={getKey(item)}
        className={cn(
          'w-[calc(50%-0.3125rem)] tab:w-[17.625rem] pc:w-[calc((100%-2.5rem)/3)]',
          index === 3 && 'tab:hidden',
        )}
      >
        {renderCard(item)}
      </div>
    ))}
  </div>
)

export { FeaturedGrid }

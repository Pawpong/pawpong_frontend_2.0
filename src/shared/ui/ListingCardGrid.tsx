import type { Key, ReactNode } from 'react'

interface ListingCardGridProps<T> {
  items: readonly T[]
  getKey: (item: T) => Key
  renderItem: (item: T) => ReactNode
}

/** 탐색형 카드 목록의 반응형 그리드 레이아웃. */
const ListingCardGrid = <T,>({ items, getKey, renderItem }: ListingCardGridProps<T>) => (
  <div className="grid grid-cols-2 gap-4 tab:mx-[2.75rem] tab:gap-5 pc:mx-[2.875rem] pc:grid-cols-4">
    {items.map((item) => (
      <div key={getKey(item)}>{renderItem(item)}</div>
    ))}
  </div>
)

export { ListingCardGrid }

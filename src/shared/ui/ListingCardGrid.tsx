import { Fragment, type Key, type ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const listingCardGrid = tv({
  base: 'grid grid-cols-2',
  variants: {
    layout: {
      /** 탐색·저장목록 — tab 2열 유지, PC 4열. 좌우 여백은 Container가 담당한다 */
      explore: 'gap-4 tab:gap-5 pc:grid-cols-4',
      /** 즐겨찾기 브리더·브리더 홈 분양목록 (Figma 1023-38692) — tab 3열, PC 1188px 가운데 정렬 */
      compact:
        'gap-x-2.5 gap-y-4 tab:grid-cols-3 tab:gap-5 pc:mx-auto pc:max-w-[74.25rem] pc:grid-cols-4',
    },
  },
  defaultVariants: { layout: 'explore' },
})

interface ListingCardGridProps<T> extends VariantProps<typeof listingCardGrid> {
  items: readonly T[]
  getKey: (item: T) => Key
  renderItem: (item: T, index: number) => ReactNode
}

/** 카드 목록 공용 그리드. 화면군마다 시안 규격이 달라 layout 으로 나눈다. */
const ListingCardGrid = <T,>({ items, getKey, renderItem, layout }: ListingCardGridProps<T>) => (
  <div className={listingCardGrid({ layout })}>
    {items.map((item, index) => (
      <Fragment key={getKey(item)}>{renderItem(item, index)}</Fragment>
    ))}
  </div>
)

export { ListingCardGrid }

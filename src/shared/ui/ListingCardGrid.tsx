import { Fragment, type Key, type ReactNode } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const listingCardGrid = tv({
  base: 'grid grid-cols-2',
  variants: {
    layout: {
      /**
       * 탐색·저장목록 (Figma 797:93446)
       * - mo~tab: 2열을 유지하되 카드가 282px보다 커지지 않는다.
       * - PC: 1280px 안에 282px 카드 4개를 양끝 정렬해 Figma의 50.67px 간격을 만든다.
       */
      explore:
        'mx-auto w-full max-w-[36.25rem] gap-4 tab:max-w-[36.5rem] tab:gap-5 pc:max-w-none pc:grid-cols-[repeat(4,17.625rem)] pc:justify-between',
      /**
       * 즐겨찾기 브리더·브리더 홈 분양목록 (Figma 1023:38692)
       * - mo: 164px 카드 2개 / tab: 최대 282px 카드 3개 / PC: 282px 카드 4개.
       * - 각 구간 상한을 두어 1439px 카드가 1440px 카드보다 커지는 역전을 막는다.
       */
      compact:
        'mx-auto w-full max-w-[21.4375rem] grid-cols-[repeat(2,minmax(0,10.25rem))] justify-between gap-y-4 tab:max-w-[55.375rem] tab:grid-cols-[repeat(3,minmax(0,17.625rem))] tab:justify-center tab:gap-5 pc:max-w-[74.25rem] pc:grid-cols-[repeat(4,minmax(0,17.625rem))]',
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

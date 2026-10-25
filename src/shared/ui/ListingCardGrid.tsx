import { Fragment, type Key, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { SkeletonBlock } from './Skeleton'

// 모든 카드 목록이 같은 열 규칙을 쓰고, 공간이 좁은 목록만 className 으로 열 수를 덮는다.
// mo 2열 / tab 3열 / 1024px 부터 5열 (그보다 좁은 5열은 카드가 125px 까지 줄어 생년월일이 잘린다)
const GRID_CLASS = 'grid grid-cols-2 w-full gap-4 tab:grid-cols-3 tab:gap-5 lap:grid-cols-5'

interface ListingCardGridProps<T> {
  items: readonly T[]
  getKey: (item: T) => Key
  renderItem: (item: T, index: number) => ReactNode
  /** 열 수·폭 상한 조정 — 2단 레이아웃처럼 컬럼이 좁아지는 자리에서 쓴다 */
  className?: string
}

/** 카드 목록과 스켈레톤이 공유하는 단일 반응형 그리드. */
const ListingCardGrid = <T,>({ items, getKey, renderItem, className }: ListingCardGridProps<T>) => (
  <div className={cn(GRID_CLASS, className)}>
    {items.map((item, index) => (
      <Fragment key={getKey(item)}>{renderItem(item, index)}</Fragment>
    ))}
  </div>
)

interface ListingCardGridSkeletonProps {
  /** 화면 낭독기에만 읽히는 로딩 안내 */
  label: ReactNode
  count?: number
  className?: string
}

/**
 * 카드 목록을 불러오는 동안 같은 격자에 카드 모양(사진 + 두 줄)의 빈 칸을 채운다.
 * 글자 안내만 보이다 카드가 한꺼번에 나타나며 화면이 출렁이던 것을 없앤다.
 */
const ListingCardGridSkeleton = ({ label, count = 8, className }: ListingCardGridSkeletonProps) => (
  <div role="status" aria-busy="true">
    <span className="sr-only">{label}</span>
    <div className={cn(GRID_CLASS, className)} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <SkeletonBlock className="aspect-square w-full rounded-lg" />
          <div className="space-y-2 p-2 tab:p-3">
            <SkeletonBlock className="h-4 w-3/4 rounded" />
            <SkeletonBlock className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export { ListingCardGrid, ListingCardGridSkeleton }

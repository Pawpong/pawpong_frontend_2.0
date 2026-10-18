import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** 자리 모양을 미리 보여주는 옅은 블록. 움직임을 줄인 환경에서는 깜빡이지 않는다. */
export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse rounded-lg bg-point-50 motion-reduce:animate-none',
        className,
      )}
    />
  )
}

/**
 * 목록을 불러오는 동안 실제 격자와 같은 틀에 빈 칸을 채운다.
 * 글자 안내만 보이다 격자로 바뀌며 화면이 출렁이던 것을 없앤다. 안내 문구는 화면 낭독기에만 읽힌다.
 */
export function GridSkeleton({
  label,
  count,
  className,
  itemClassName,
}: {
  label: ReactNode
  count: number
  /** 실제 목록 격자와 같은 클래스 */
  className?: string
  itemClassName?: string
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className={className}>
        {Array.from({ length: count }, (_, index) => (
          <SkeletonBlock key={index} className={cn('aspect-square w-full', itemClassName)} />
        ))}
      </div>
    </div>
  )
}

/**
 * 줄 목록(공지·자주 묻는 질문·임시저장·저장 피드)을 불러오는 동안 같은 자리에 줄 모양 빈 칸을 채운다.
 * 안내 문구는 화면 낭독기에만 읽힌다.
 */
export function ListRowsSkeleton({
  label,
  rows = 4,
  className,
}: {
  label: ReactNode
  rows?: number
  className?: string
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <div className="divide-y divide-neutral-150">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="space-y-2 py-4">
            <SkeletonBlock className="h-4 w-2/3 rounded" />
            <SkeletonBlock className="h-3 w-1/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

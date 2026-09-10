import type { ReactNode } from 'react'
import { tv } from 'tailwind-variants'
import { EmptyIllustration } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

// [refactored] 반복되던 여백 조합을 variant 로 고정 (px-0 py-6 하드코딩 제거)
const emptyState = tv({
  base: 'flex flex-col items-center justify-center gap-3 text-center text-sm font-medium text-neutral-700',
  variants: {
    size: {
      md: 'px-4 py-10',
      // 상세 카드 안에서는 카드가 이미 좌우 여백을 가지므로 세로 여백만 준다
      compact: 'px-0 py-6',
    },
  },
  defaultVariants: { size: 'md' },
})

interface EmptyStateProps {
  message: ReactNode
  action?: ReactNode
  size?: 'md' | 'compact'
  /** 로딩·오류처럼 "비어 있음"이 아닌 상태에서는 일러스트를 숨긴다. */
  illustration?: boolean
  role?: 'status' | 'alert'
  className?: string
  illustrationClassName?: string
}

/** 조회 결과가 비어 있을 때 일러스트와 안내 문구를 함께 보여주는 공통 상태. */
const EmptyState = ({
  message,
  action,
  size,
  illustration = true,
  role = 'status',
  className,
  illustrationClassName,
}: EmptyStateProps) => (
  <div role={role} className={cn(emptyState({ size }), className)}>
    {illustration && (
      <EmptyIllustration
        className={cn('h-[7.4325rem] w-[8.3165rem] shrink-0', illustrationClassName)}
      />
    )}
    {message && <p>{message}</p>}
    {action}
  </div>
)

export { EmptyState }
export type { EmptyStateProps }

'use client'

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { badgeVariants } from './Badge'

interface FilterChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  /** responsive: 모바일 md(10px) → tab+ lg(14px·h-29) */
  size?: 'lg' | 'md' | 'responsive'
  className?: string
}

/** 선택형 필터 칩 (Figma 975-19584) — 선택 시 point 채움, hover 시 point-hover. */
const FilterChip = ({ selected, onClick, children, size = 'lg', className }: FilterChipProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      badgeVariants({
        variant: selected ? 'pointFilled' : 'primaryOutline',
        size: size === 'lg' ? 'lg' : 'md',
      }),
      'hover:bg-point-400',
      size === 'responsive' && 'tab:h-[1.8125rem] tab:py-1 tab:text-sm',
      className,
    )}
  >
    {children}
  </button>
)

export { FilterChip }

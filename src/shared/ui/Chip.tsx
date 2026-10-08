import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 선택형 알약 칩 (Figma label-badge 975-19584) — 필터·키워드·상태 트리거 공용.
// 선택 시 point 채움, 크기는 sm(h-24·10px) / md(h-29·14px) / responsive(모바일 h-28·13px → tab+ md).
const chipStyles = tv({
  base: 'focus-ring touch-target relative inline-flex shrink-0 items-center gap-1 rounded-full border border-brand px-2 font-semibold whitespace-nowrap text-brand transition-colors hover:bg-action-primary-hover',
  variants: {
    selected: {
      true: 'bg-action-primary',
      false: 'bg-base-white',
    },
    size: {
      sm: 'h-6 text-[0.625rem] leading-[1.5]',
      md: 'h-[1.8125rem] text-body-md',
      // 모바일도 10px는 너무 작고 누르기 어려워 메타 텍스트(13px)·h-28로 맞춘다
      responsive: 'h-7 text-[0.8125rem] leading-[1.5] tab:h-[1.8125rem] tab:text-body-md',
    },
  },
  defaultVariants: { selected: false, size: 'md' },
})

type ChipVariantProps = VariantProps<typeof chipStyles> & {
  class?: never
  className?: never
  style?: never
}
const chipVariants = ({ selected, size }: ChipVariantProps = {}) => chipStyles({ selected, size })
type ChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> &
  ChipVariantProps & { className?: never; style?: never }

const Chip = ({ selected, size, type = 'button', ...props }: ChipProps) => (
  <button
    {...props}
    type={type}
    aria-pressed={selected ?? undefined}
    className={chipVariants({ selected, size })}
  />
)

export { Chip, chipVariants, type ChipProps }

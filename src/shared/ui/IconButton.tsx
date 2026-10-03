import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 아이콘 전용 버튼 — 정사각 터치 영역 + tone 별 hover. 아이콘 크기는 넘겨주는 아이콘이 정한다.
// aria-label 필수. edge는 아이콘을 가장자리에 맞추며 버튼의 터치 영역 크기는 유지한다.
const iconButtonStyles = tv({
  base: 'focus-ring inline-flex shrink-0 rounded-lg items-center justify-center transition-colors disabled:cursor-not-allowed disabled:text-action-disabled-fg',
  variants: {
    edge: {
      none: '',
      start: '-ml-2',
      end: '-mr-2',
      both: '-m-2',
    },
    tone: {
      neutral: 'text-action-dark hover:bg-action-subtle',
      muted: 'text-action-muted-fg hover:bg-action-subtle hover:text-action-dark',
      brand: 'text-brand hover:bg-brand-subtle hover:text-brand-hover',
      brandSoft: 'bg-brand-subtle text-brand hover:text-brand-hover',
      danger: 'text-action-muted-fg hover:bg-action-subtle hover:text-danger',
      // 사진 위에 얹는 버튼
      overlay: 'bg-action-dark/60 text-base-white hover:bg-action-dark/80',
      surface:
        'border border-action-disabled bg-base-white text-action-dark hover:bg-action-subtle',
      // 배경과 박스 테두리 없이 별 자체의 빈 상태/브랜드 색 채움으로 표현한다.
      favorite:
        'bg-transparent text-brand hover:bg-brand-subtle hover:text-brand-hover aria-disabled:cursor-wait aria-disabled:opacity-60 motion-reduce:transition-none',
    },
    size: {
      xs: 'size-6',
      sm: 'size-8',
      md: 'size-10',
      touch: 'size-11',
      lg: 'size-12',
      responsive: 'size-8 tab:size-12',
    },
  },
  compoundVariants: [
    { size: 'sm', edge: 'start', className: '-ml-1' },
    { size: 'sm', edge: 'end', className: '-mr-1' },
    { size: 'sm', edge: 'both', className: '-m-1' },
  ],
  defaultVariants: { tone: 'neutral', size: 'md', edge: 'none' },
})

type IconButtonVariantProps = VariantProps<typeof iconButtonStyles> & {
  class?: never
  className?: never
  style?: never
}
const iconButtonVariants = Object.assign(
  ({ tone, size, edge }: IconButtonVariantProps = {}) => iconButtonStyles({ tone, size, edge }),
  { variants: iconButtonStyles.variants },
)

type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'className' | 'style'
> &
  IconButtonVariantProps & { 'aria-label': string; className?: never; style?: never }

const IconButton = ({ tone, size, edge, type = 'button', ...props }: IconButtonProps) => (
  <button {...props} type={type} className={iconButtonVariants({ tone, size, edge })} />
)

export { IconButton, iconButtonVariants, type IconButtonProps }

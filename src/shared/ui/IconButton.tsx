import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 아이콘 전용 버튼 — 정사각 터치 영역 + tone 별 hover. 아이콘 크기는 넘겨주는 아이콘이 정한다.
// aria-label 필수. edge는 아이콘을 가장자리에 맞추며 버튼의 터치 영역 크기는 유지한다.
const iconButtonStyles = tv({
  base: 'focus-ring touch-target relative inline-flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:text-action-disabled-fg',
  variants: {
    // 사진에 겹쳐 얹는 동그란 버튼은 circle
    shape: {
      square: 'rounded-lg',
      circle: 'rounded-full',
    },
    edge: {
      none: '',
      end: '-mr-2',
      both: '-m-2',
    },
    tone: {
      neutral: 'text-action-dark hover:bg-action-subtle',
      muted: 'text-action-muted-fg hover:bg-action-subtle hover:text-action-dark',
      brand: 'text-brand hover:bg-brand-subtle hover:text-brand-hover',
      // 버튼 노랑(Button primary 와 같은 action-primary #fff0af) 위에 브랜드색 아이콘 — 채팅 첨부
      primary:
        // 비활성이면 Button primary 처럼 회색 면으로 두고, 누를 수 있을 때만 hover·press 색이 바뀐다
        'bg-action-primary text-brand enabled:hover:bg-action-primary-hover enabled:active:bg-action-primary-press disabled:bg-action-disabled',
      danger: 'text-action-muted-fg hover:bg-action-subtle hover:text-danger',
      // 사진 위에 얹는 버튼
      overlay: 'bg-action-dark/60 text-base-white hover:bg-action-dark/80',
      surface:
        'border border-action-disabled bg-base-white text-action-dark hover:bg-action-subtle',
      // 글자 버튼(secondary) 옆에 나란히 놓는 아이콘 버튼 — 같은 테두리로 한 줄 버튼처럼 보인다
      outline:
        'border border-action-border bg-base-white text-brand hover:bg-action-subtle active:bg-action-subtle-press',
      // 별만 표시하고, 선택하면 안쪽을 노랗게 채운다. 호버로 배경이나 색을 바꾸지 않는다.
      favorite:
        'bg-transparent text-brand transition-none [-webkit-tap-highlight-color:transparent] aria-disabled:cursor-wait',
    },
    size: {
      xs: 'size-6',
      sm: 'size-8',
      md: 'size-10',
      touch: 'size-11',
      lg: 'size-12',
      // 아이콘 크기 그대로 — 둘레 여백이 없어 음수 여백 없이 옆 내용과 끝이 맞는다.
      // 누르는 칸은 touch-target 이 터치 기기에서 44px 로 넓힌다
      fit: '',
    },
  },
  compoundVariants: [
    { size: 'sm', edge: 'end', className: '-mr-1' },
    { size: 'sm', edge: 'both', className: '-m-1' },
  ],
  defaultVariants: { shape: 'square', tone: 'neutral', size: 'md', edge: 'none' },
})

type IconButtonVariantProps = VariantProps<typeof iconButtonStyles> & {
  class?: never
  className?: never
  style?: never
}
const iconButtonVariants = ({ shape, tone, size, edge }: IconButtonVariantProps = {}) =>
  iconButtonStyles({ shape, tone, size, edge })

type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'className' | 'style'
> &
  IconButtonVariantProps & { 'aria-label': string; className?: never; style?: never }

const IconButton = ({ shape, tone, size, edge, type = 'button', ...props }: IconButtonProps) => (
  <button {...props} type={type} className={iconButtonVariants({ shape, tone, size, edge })} />
)

export { IconButton, iconButtonVariants, type IconButtonProps }

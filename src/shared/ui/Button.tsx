import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 도메인 버튼 래퍼의 바깥 슬롯에도 같은 폭 규칙을 적용한다.
export const BUTTON_WIDTH_CLASSES = {
  auto: '',
  full: 'w-full',
  // 가로 flex 안에서 같은 줄 버튼끼리 나눠 채움. 세로 flex에서는 full을 사용한다.
  fill: 'min-w-0 flex-1',
  responsive: 'w-full tab:w-48',
} as const

// 버튼의 모양은 여기서만 정의한다. 최대폭·여백·위치·노출은 부모 레이아웃의 책임.
const buttonStyles = tv({
  base: 'focus-ring inline-flex rounded-lg shrink-0 items-center justify-center gap-1 leading-[1.5] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:text-action-disabled-fg motion-reduce:transition-none',
  variants: {
    intent: {
      // Figma BaseButton — default point-500 / hover point-300 / press point-600
      primary:
        'bg-action-primary text-action-dark hover:bg-action-primary-hover active:bg-action-primary-press disabled:bg-action-disabled',
      secondary:
        'border border-action-border bg-base-white text-action-dark hover:bg-action-subtle active:bg-action-subtle-press',
      dark: 'bg-action-dark text-neutral-50 hover:bg-action-dark-hover disabled:bg-action-disabled',
      // 소셜 로그인: 기존 Figma FillButton(2609:258329/258347) 및 각 사 브랜드 규격.
      google:
        'bg-[#F0F0F0] text-neutral-850 hover:bg-neutral-150 active:bg-neutral-300 disabled:bg-action-disabled',
      kakao:
        'bg-[#FFE812] text-neutral-850 hover:brightness-[0.98] active:brightness-95 disabled:bg-action-disabled',
      naver:
        'bg-[#03C75A] text-base-white hover:brightness-[0.98] active:brightness-95 disabled:bg-action-disabled',
      apple:
        'bg-black text-base-white hover:brightness-[1.15] active:brightness-125 disabled:bg-action-disabled',
      // 팔로우 등 회색 채움
      neutral: 'bg-action-neutral font-medium text-base-white disabled:bg-action-disabled',
      // txt btn — 배경 없이 hover/press 에만 옅은 배경
      ghost:
        'text-action-dark hover:bg-action-subtle active:bg-action-subtle-press disabled:bg-transparent',
      link: 'text-brand hover:text-brand-hover',
      // 삭제·탈퇴·언팔로우처럼 되돌릴 수 없는 액션 — secondary 틀에 빨간 글자
      danger:
        'border border-action-border bg-base-white text-danger hover:bg-action-subtle hover:text-danger-hover active:bg-action-subtle-press',
    },
    size: {
      sm: 'h-8 px-3 text-body-md',
      md: 'h-10 px-4 text-body-md',
      lg: 'h-12 px-5 text-body-lg',
      // 문장 속 글자 버튼 — 높이 없이 글자만
      inline: 'px-1 text-body-md',
    },
    width: BUTTON_WIDTH_CLASSES,
  },
  compoundVariants: [{ intent: 'link', className: 'px-0' }],
  // 기본 = 커뮤니티 글쓰기 버튼 (primary · h-48 · 16px)
  defaultVariants: { intent: 'primary', size: 'lg', width: 'auto' },
})

type ButtonVariantProps = VariantProps<typeof buttonStyles> & {
  class?: never
  className?: never
  style?: never
}

// tv의 class/className 탈출구를 공개하지 않는다. 링크도 Button과 동일한 prop만 받는다.
const buttonVariants = ({ intent, size, width }: ButtonVariantProps = {}) =>
  buttonStyles({ intent, size, width })

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> &
  ButtonVariantProps & { className?: never; style?: never }

const Button = ({ intent, size, width, type = 'button', ...props }: ButtonProps) => (
  <button {...props} type={type} className={buttonVariants({ intent, size, width })} />
)

export { Button, buttonVariants, type ButtonProps, type ButtonVariantProps }

import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { FireIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

const badgeVariants = tv({
  base: 'inline-flex items-center justify-center gap-[0.125rem] rounded-[999px] whitespace-nowrap font-semibold',
  variants: {
    variant: {
      outline:
        'border border-[#a8a8a8] text-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]',
      filled:
        'bg-[#e1e1e1] text-[#5d5d5d] px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]',
      status:
        'bg-[#5d5d5d] text-white px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem]',
      // Figma 디자인 시스템 뱃지 (743-68292) — large 기준, size="md"로 medium 전환
      default:
        'border border-neutral-300 bg-white px-2 py-1 text-base leading-[1.5] font-medium text-neutral-700',
      active: 'bg-neutral-850 px-2 py-1 text-base leading-[1.5] font-medium text-neutral-50',
      disabled: 'bg-neutral-150 px-2 py-1 text-base leading-[1.5] font-medium text-neutral-400',
      // Figma label-badge (975-19584) — primary 채움/아웃라인, lg 14px·h-29 / md 10px·h-24
      primaryFilled: 'bg-primary-500 text-white',
      primaryOutline: 'border border-primary-500 bg-white text-primary-500',
      // 필터 칩 선택 상태 (975-19584 active) — point 채움 + primary 테두리/텍스트
      pointFilled: 'border border-primary-500 bg-point-500 text-primary-500',
      // primaryFilled와 동일 사이즈의 회색 채움 (분양완료 등 비활성 상태)
      neutralFilled: 'bg-neutral-150 text-neutral-400',
    },
    size: {
      lg: '',
      md: '',
    },
  },
  compoundVariants: [
    // medium: h-24 / py-2 / 14px (default·active·disabled 전용)
    { variant: ['default', 'active', 'disabled'], size: 'md', class: 'h-6 px-2 py-0.5 text-sm' },
    // label-badge primary: lg 14px·h-29 / md 10px·h-24
    {
      variant: ['primaryFilled', 'primaryOutline', 'pointFilled', 'neutralFilled'],
      size: 'lg',
      class: 'h-[1.8125rem] px-2 py-1 text-sm',
    },
    {
      variant: ['primaryFilled', 'primaryOutline', 'pointFilled', 'neutralFilled'],
      size: 'md',
      class: 'h-6 px-2 py-0 text-[0.625rem]',
    },
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'lg',
  },
})

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

type PopularBadgeContentSize = 'md' | 'lg' | 'responsive'

const POPULAR_BADGE_ICON_SIZE: Record<PopularBadgeContentSize, string> = {
  md: 'h-3.5 w-3',
  lg: 'h-[1.125rem] w-4',
  responsive: 'h-3.5 w-3 tab:h-[1.125rem] tab:w-4',
}

/** 인기 Badge와 인기 필터가 공유하는 불 아이콘 + 라벨. */
export const PopularBadgeContent = ({
  size = 'lg',
  iconClassName,
}: {
  size?: PopularBadgeContentSize
  iconClassName?: string
}) => (
  <>
    <FireIcon className={cn('shrink-0', POPULAR_BADGE_ICON_SIZE[size], iconClassName)} />
    인기
  </>
)

export { badgeVariants }

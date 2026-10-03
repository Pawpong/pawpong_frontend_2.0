import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'
import { FireIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

// [refactored] label-badge 계열 — lg/md/responsive 크기가 적용되는 variant 목록 (compoundVariants 3곳 공유)
const LABEL_VARIANTS: ('primaryFilled' | 'primaryOutline' | 'pointFilled' | 'neutralFilled')[] = [
  'primaryFilled',
  'primaryOutline',
  'pointFilled',
  'neutralFilled',
]

const badgeVariants = tv({
  // [refactored] 토큰이 있는 임의값을 토큰으로 (gap-[0.125rem] → gap-0.5, rounded-[999px] → rounded-full)
  base: 'inline-flex items-center justify-center gap-0.5 rounded-full whitespace-nowrap font-semibold',
  variants: {
    variant: {
      // [refactored] 같은 값의 토큰으로 교체, 사용처 없던 filled·status 제거
      outline: 'border border-[#a8a8a8] text-[#a8a8a8] px-2.5 py-1 text-sm leading-5.5',
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
      // 목록 개수 카운트 (임시저장 등) — point 채움 + neutral-850 텍스트
      pointCount: 'bg-point-500 px-2 py-0.5 text-xs font-semibold text-neutral-850',
      // 진행 중 상태 표시 (작성 중 등) — VerificationContent 상태 뱃지와 동일 톤
      primarySoft: 'bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700',
    },
    size: {
      lg: '',
      md: '',
      responsive: '',
    },
  },
  compoundVariants: [
    // medium: h-24 / py-2 / 14px (default·active·disabled 전용)
    { variant: ['default', 'active', 'disabled'], size: 'md', class: 'h-6 px-2 py-0.5 text-sm' },
    // label-badge primary: lg 14px·h-29 / md 10px·h-24
    { variant: LABEL_VARIANTS, size: 'lg', class: 'h-[1.8125rem] px-2 py-1 text-sm' },
    { variant: LABEL_VARIANTS, size: 'md', class: 'h-6 px-2 py-0 text-[0.625rem]' },
    // 상태 뱃지: 필터 칩(Chip responsive)과 같은 크기 — 13px·28 → 14px·29.
    // 높이는 고정하지 않고 줄높이 + 패딩 + 테두리로 만든다 (모바일 20+6+2, tab+ 21+6+2)
    {
      variant: LABEL_VARIANTS,
      size: 'responsive',
      class: 'px-2 py-0.75 text-[0.8125rem] leading-5 tab:text-body-md tab:leading-normal',
    },
    // 채움 뱃지는 테두리가 없어 아웃라인보다 2px 낮아지므로 투명 테두리로 높이를 맞춘다
    {
      variant: ['primaryFilled', 'neutralFilled'],
      size: 'responsive',
      class: 'border border-transparent',
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

/** 애정도 뱃지 (Figma 743-68293) — pointFilled(bg-point-500 + primary 테두리/텍스트) */
export const AffectionBadge = ({
  children = '애정도',
  size = 'lg',
  className,
}: {
  children?: React.ReactNode
  size?: BadgeProps['size']
  className?: string
}) => (
  <Badge variant="pointFilled" size={size} className={className}>
    {children}
  </Badge>
)

/** 인기 뱃지 — 불 아이콘 + "인기" (variant/size/위치는 사용처에서 주입). 콘텐츠는 FireIcon로 통일 */
export const PopularBadge = ({
  variant = 'primaryOutline',
  size,
  iconSize = 'md',
  className,
}: {
  variant?: BadgeProps['variant']
  size?: BadgeProps['size']
  iconSize?: PopularBadgeContentSize
  className?: string
}) => (
  <Badge variant={variant} size={size} className={cn('gap-1', className)}>
    <PopularBadgeContent size={iconSize} />
  </Badge>
)

export { badgeVariants }

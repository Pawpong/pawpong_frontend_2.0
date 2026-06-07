import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
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
        'border border-[#cacaca] bg-white px-2 py-1 text-base leading-[1.5] font-medium text-[#6b6b6b]',
      active: 'bg-[#3e3e3e] px-2 py-1 text-base leading-[1.5] font-medium text-[#f6f6f6]',
      disabled: 'bg-[#e4e4e4] px-2 py-1 text-base leading-[1.5] font-medium text-[#b8b8b8]',
    },
    size: {
      lg: '',
      md: '',
    },
  },
  compoundVariants: [
    // medium: h-24 / py-2 / 14px (default·active·disabled 전용)
    { variant: ['default', 'active', 'disabled'], size: 'md', class: 'h-6 px-2 py-0.5 text-sm' },
  ],
  defaultVariants: {
    variant: 'outline',
  },
})

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }

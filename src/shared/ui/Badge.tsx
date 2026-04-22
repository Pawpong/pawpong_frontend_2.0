import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const badgeVariants = tv({
  base: 'inline-flex items-center justify-center rounded-[999px] whitespace-nowrap px-[0.625rem] py-[0.25rem] text-[0.875rem] leading-[1.375rem] font-semibold',
  variants: {
    variant: {
      outline: 'border border-[#a8a8a8] text-[#a8a8a8]',
      filled: 'bg-[#e1e1e1] text-[#5d5d5d]',
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
})

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

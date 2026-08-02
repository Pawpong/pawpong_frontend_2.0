import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'

const inputVariants = tv({
  base: 'flex h-[2.8125rem] w-full rounded-lg border bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-neutral-850 outline-none placeholder:text-neutral-500 focus:border-[#0072ff] disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-150 disabled:text-neutral-400',
  variants: {
    state: {
      default: 'border-neutral-150',
      error: 'border-error-500',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(inputVariants({ state }), className)} {...props} />
  ),
)
Input.displayName = 'Input'

export { Input, inputVariants, type InputProps }

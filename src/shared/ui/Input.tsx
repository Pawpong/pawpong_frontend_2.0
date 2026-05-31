import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const inputVariants = tv({
  base: 'flex h-[2.8125rem] w-full rounded-lg border bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6] focus:border-[#256ef4] disabled:cursor-not-allowed disabled:border-[#dbdbdb] disabled:bg-[#e4e4e4] disabled:text-[#b8b8b8]',
  variants: {
    state: {
      default: 'border-[#e4e4e4]',
      error: 'border-[#d63d4a]',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(inputVariants({ state }), className)}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input, inputVariants, type InputProps }

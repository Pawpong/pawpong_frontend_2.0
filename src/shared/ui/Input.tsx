import * as React from 'react'
import { cn } from '@/shared/lib/Cn'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex w-full rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-sm leading-[1.375rem] font-medium text-text-primary placeholder:text-[#a8a8a8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-base',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

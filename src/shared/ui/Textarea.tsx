import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'

const textareaVariants = tv({
  base: 'flex h-[6.5625rem] w-full resize-none rounded-lg border bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6] focus:border-[#256ef4] disabled:cursor-not-allowed disabled:border-[#dbdbdb] disabled:bg-[#e4e4e4] disabled:text-[#b8b8b8]',
  variants: {
    state: {
      default: 'border-[#cacaca]',
      error: 'border-[#d63d4a]',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ state }), className)}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants, type TextareaProps }

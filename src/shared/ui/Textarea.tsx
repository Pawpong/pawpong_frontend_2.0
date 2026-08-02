import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'

const textareaVariants = tv({
  base: 'flex h-[6.5625rem] w-full resize-none rounded-lg border bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-neutral-850 outline-none placeholder:text-neutral-500 focus:border-info-500 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-150 disabled:text-neutral-400',
  variants: {
    // Figma 916-5678 status — default(#cacaca) / fill(#a6a6a6, 입력값 있음) / error(#d63d4a)
    // focus(#256ef4)·disabled는 base의 의사클래스로 처리
    state: {
      default: 'border-neutral-300',
      fill: 'border-neutral-500',
      error: 'border-error-500',
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
    <textarea ref={ref} className={cn(textareaVariants({ state }), className)} {...props} />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants, type TextareaProps }

import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'
import { cn } from '@/shared/lib/cn'

// [refactored] 글쓰기 화면의 테두리 없는 입력(Input·Textarea composer)이 함께 쓴다 — 여백이 같아야 본문·태그 글자가 한 줄에서 시작한다
const COMPOSER_FIELD =
  'border-0 px-4 text-body-lg font-normal focus-visible:ring-2 focus-visible:ring-primary-200'

const inputVariants = tv({
  base: 'flex h-10 w-full rounded-lg border bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-neutral-850 outline-none placeholder:text-neutral-500 focus:border-info-500 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-150 disabled:text-neutral-400',
  variants: {
    state: {
      default: 'border-neutral-150',
      error: 'border-error-500',
    },
    // field: 폼 필드용 테두리 상자 (기본)
    // composer: 글쓰기 화면의 테두리 없는 한 줄 입력
    variant: {
      field: '',
      composer: `${COMPOSER_FIELD} h-11 tab:text-body-md`, // [refactored]
    },
  },
  defaultVariants: {
    state: 'default',
    variant: 'field',
  },
})

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, variant, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(inputVariants({ state, variant }), className)}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input, inputVariants, COMPOSER_FIELD, type InputProps }

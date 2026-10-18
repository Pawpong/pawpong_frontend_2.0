import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'
import { cn } from '@/shared/lib/cn'
import { COMPOSER_FIELD } from './Input'

const textareaVariants = tv({
  base: 'flex w-full resize-none rounded-lg border bg-white px-3 text-[0.875rem] font-medium leading-[1.5] text-neutral-850 outline-none placeholder:text-neutral-500 focus:border-info-500 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-150 disabled:text-neutral-400',
  variants: {
    // autoGrow: Input 과 같은 한 줄 높이(40)에서 시작해 호출부가 내용에 맞춰 높이를 늘린다 (채팅 입력)
    autoGrow: {
      true: 'h-10 min-h-10 py-2',
      false: 'h-[6.5625rem] py-3',
    },
    // Figma status — default: border/tertiary(#e4e4e4, 3414-752441·1056-46147 기준. Input 과 동일)
    // / fill(#a6a6a6, 입력값 있음) / error(#d63d4a)
    // focus(#256ef4)·disabled는 base의 의사클래스로 처리
    state: {
      default: 'border-neutral-150',
      fill: 'border-neutral-500',
      error: 'border-error-500',
    },
    // field: 폼 필드용 테두리 상자 (기본)
    // composer: 글쓰기 본문 — 테두리 없는 큰 글자 입력창. autoGrow 의 py 를 덮도록 맨 뒤에 둔다
    variant: {
      field: '',
      composer: `${COMPOSER_FIELD} min-h-64 py-4 tab:min-h-80`, // [refactored] 여백·글자는 Input composer 와 공유
    },
  },
  defaultVariants: {
    variant: 'field',
    autoGrow: false,
    state: 'default',
  },
})

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  VariantProps<typeof textareaVariants>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, state, autoGrow, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ variant, state, autoGrow }), className)}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants, type TextareaProps }

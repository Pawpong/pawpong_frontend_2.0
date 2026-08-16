import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'

// 디자인 시스템 BaseButton. 쓰는 variant부터 정의 — 더 필요하면 추가
// primary/outline은 알약형(size 필요), text·fill은 자체 완결(size 미사용)
const buttonVariants = tv({
  base: 'flex items-center justify-center leading-[1.5] font-semibold text-neutral-850 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      // primary: Figma BaseButton(743-70331/70327/70329) — bg/interactive/point-color 토큰을 그대로 쓴다.
      // default point-500(#fffe72) / hover point-300(#fffeaa) / press point-600(#dbda5b), 글자색은 상태 무관 #3e3e3e.
      // disabled 는 opacity-100 으로 base 의 opacity-50 을 무효화
      primary:
        'rounded-full bg-point-500 p-2 transition-colors hover:bg-point-300 active:bg-point-600 disabled:bg-neutral-150 disabled:text-neutral-400 disabled:opacity-100',
      outline: 'rounded-full border border-neutral-300 bg-white p-2',
      // text(txt btn): hover 배경 #f6f6f6 / press 배경 #ededed / disabled 텍스트 #c2c2c2, rounded-8
      text: 'rounded-lg px-1 text-sm hover:bg-neutral-50 active:bg-neutral-100 disabled:text-[#c2c2c2] disabled:opacity-100',
      // FillButton (다크) — h-40, rounded-8, 16px #f6f6f6
      fill: 'h-10 rounded-lg bg-neutral-850 p-2 text-base text-neutral-50',
      // ghost: 배경/보더 없는 텍스트 버튼 (CtaModal 보조 액션)
      ghost: 'text-neutral-700 hover:text-neutral-850',
    },
    size: {
      sm: 'h-8 text-sm',
      lg: 'h-12 text-base',
    },
  },
  defaultVariants: { variant: 'primary' },
})

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const Button = ({ className, variant, size, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
)

export { Button, buttonVariants, type ButtonProps }

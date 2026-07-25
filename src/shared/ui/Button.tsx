import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'

// 디자인 시스템 BaseButton. 쓰는 variant부터 정의 — 더 필요하면 추가
// primary/outline은 알약형(size 필요), text·fill은 자체 완결(size 미사용)
const buttonVariants = tv({
  base: 'flex items-center justify-center leading-[1.5] font-semibold text-[#3e3e3e] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      // primary: hover 텍스트 #6b6b6b / press 배경 #f3ec59 / disabled 배경·텍스트(opacity-100로 base opacity-50 무효화)
      primary:
        'rounded-full bg-[#fffa94] p-2 transition-colors hover:text-[#6b6b6b] active:bg-[#f3ec59] disabled:bg-[#e4e4e4] disabled:text-[#b8b8b8] disabled:opacity-100',
      outline: 'rounded-full border border-[#cacaca] bg-white p-2',
      // text(txt btn): hover 배경 #f6f6f6 / press 배경 #ededed / disabled 텍스트 #c2c2c2, rounded-8
      text: 'rounded-lg px-1 text-sm hover:bg-[#f6f6f6] active:bg-[#ededed] disabled:text-[#c2c2c2] disabled:opacity-100',
      // FillButton (다크) — h-40, rounded-8, 16px #f6f6f6
      fill: 'h-10 rounded-lg bg-[#3e3e3e] p-2 text-base text-[#f6f6f6]',
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

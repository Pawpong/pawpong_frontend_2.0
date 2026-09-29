import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 시트·팝오버 안의 전폭 행 버튼 — 행 사이 구분선은 첫 행을 빼고 자동으로 그린다.
const actionSheetItemVariants = tv({
  base: 'focus-ring-inset w-full border-t border-action-disabled py-3.5 text-center text-body-md font-medium transition-colors first:border-t-0 hover:bg-action-subtle disabled:cursor-not-allowed disabled:text-action-disabled-fg',
  variants: {
    tone: {
      default: 'text-action-dark',
      danger: 'text-danger',
    },
  },
  defaultVariants: { tone: 'default' },
})

type ActionSheetItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> & { className?: never; style?: never } & VariantProps<typeof actionSheetItemVariants>

const ActionSheetItem = ({ tone, type = 'button', ...props }: ActionSheetItemProps) => (
  <button {...props} type={type} className={actionSheetItemVariants({ tone })} />
)

export { ActionSheetItem, type ActionSheetItemProps }

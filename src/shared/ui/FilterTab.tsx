import type { ButtonHTMLAttributes } from 'react'
import { tv } from '@/shared/lib/tv'

// 목록 위 선택 필터 — 테두리 없는 글자 탭. 고른 탭만 글자 아래쪽 절반에 옅은 노랑 형광펜을 깔고
// 왼쪽에 작은 갈색 네모를 둔다. 상태 표시(StatusLabel)와 모양이 겹치지 않게 칩 모양을 쓰지 않는다.
const filterTabStyles = tv({
  base: 'focus-ring touch-target relative inline-flex h-10 shrink-0 items-center gap-1 rounded-sm px-2 text-[0.9375rem] font-semibold whitespace-nowrap transition-colors tab:h-11 tab:text-body-lg',
  variants: {
    selected: {
      true: 'bg-[linear-gradient(transparent_44%,var(--color-secondary-200)_44%,var(--color-secondary-200)_70%,transparent_70%)] pl-4 text-primary-700 before:absolute before:top-1/2 before:left-1.5 before:size-1.5 before:-translate-y-1/2 before:bg-primary-700',
      false: 'text-neutral-700 hover:text-primary-700',
    },
  },
  defaultVariants: { selected: false },
})

type FilterTabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
  selected: boolean
  className?: never
  style?: never
}

const FilterTab = ({ selected, type = 'button', ...props }: FilterTabProps) => (
  <button
    {...props}
    type={type}
    aria-pressed={selected}
    className={filterTabStyles({ selected })}
  />
)

export { FilterTab, type FilterTabProps }

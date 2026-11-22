import type { ButtonHTMLAttributes } from 'react'
import { tv } from '@/shared/lib/tv'

// 목록 위 선택 필터.
// text: 테두리 없는 글자 탭. 고른 탭만 글자 아래쪽 절반에 옅은 노랑 형광펜을 깔고 왼쪽에 작은 갈색 네모를 둔다.
// chip: 30px 테두리 칩 — 탐색 필터 칩(Dropdown chip)과 같은 모양. 고르면 캐러멜 테두리 + 크림 면.
// 상태 표시(StatusLabel)는 픽셀 기호 띠라 어느 모양과도 겹치지 않는다.
const filterTabStyles = tv({
  base: 'focus-ring touch-target relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap transition-colors',
  variants: {
    look: {
      text: 'h-10 rounded-sm px-2 text-[0.9375rem] font-semibold tab:h-11 tab:text-body-lg',
      chip: 'h-[1.875rem] rounded-lg border px-2.5 text-xs',
    },
    selected: { true: '', false: '' },
  },
  compoundVariants: [
    {
      look: 'text',
      selected: true,
      class:
        'bg-[linear-gradient(transparent_44%,var(--color-secondary-200)_44%,var(--color-secondary-200)_70%,transparent_70%)] pl-4 text-primary-700 before:absolute before:top-1/2 before:left-1.5 before:size-1.5 before:-translate-y-1/2 before:bg-primary-700',
    },
    { look: 'text', selected: false, class: 'text-neutral-700 hover:text-primary-700' },
    {
      look: 'chip',
      selected: true,
      class: 'border-primary-500 bg-primary-50 font-bold text-neutral-850',
    },
    {
      look: 'chip',
      selected: false,
      class: 'border-neutral-300 bg-white font-semibold text-neutral-700 hover:bg-neutral-50',
    },
  ],
  defaultVariants: { look: 'text', selected: false },
})

type FilterTabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
  selected: boolean
  look?: 'text' | 'chip'
  className?: never
  style?: never
}

const FilterTab = ({ selected, look = 'text', type = 'button', ...props }: FilterTabProps) => (
  <button
    {...props}
    type={type}
    aria-pressed={selected}
    className={filterTabStyles({ selected, look })}
  />
)

export { FilterTab, type FilterTabProps }

import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface SideNavItem {
  key: string
  label: string
  /** 이름 앞 그림 (도트 아이콘·동물 얼굴). 없으면 이름만 */
  icon?: ReactNode
  selected: boolean
  onSelect: () => void
}

/** PC 사이드바 목록 — 그림 + 이름 한 줄씩, 고른 줄은 옅은 면으로 표시한다 (커뮤니티·탐색 공통) */
const SideNav = ({ label, items }: { label: string; items: readonly SideNavItem[] }) => (
  <nav aria-label={label} className="flex flex-col gap-0.5">
    {items.map((item) => (
      <button
        key={item.key}
        type="button"
        aria-pressed={item.selected}
        onClick={item.onSelect}
        className={cn(
          'flex min-h-10 items-center gap-2.5 rounded-xl px-4 text-left text-body-md focus-ring transition-colors',
          item.selected
            ? 'bg-neutral-100 font-semibold text-neutral-850'
            : 'font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-850',
        )}
      >
        {item.icon}
        {item.label}
      </button>
    ))}
  </nav>
)

export { SideNav, type SideNavItem }

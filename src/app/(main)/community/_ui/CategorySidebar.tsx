'use client'

import { cn } from '@/shared/lib/cn'
import { Separator } from '@/shared/ui'
import type { CommunityCategory } from '@/shared/mocks'

interface CategorySidebarProps {
  categories: CommunityCategory[]
  selected: string
  onSelect: (value: string) => void
}

const CategorySidebar = ({ categories, selected, onSelect }: CategorySidebarProps) => {
  return (
    <aside className="hidden w-[13.5625rem] shrink-0 rounded-2xl border border-border-light tab:block">
      <p className="px-[1.0625rem] pt-4 text-sm leading-[1.375rem] font-semibold text-text-primary">
        카테고리
      </p>

      <Separator className="mt-4 bg-border-light" />

      <ul className="flex flex-col gap-2 px-[1.0625rem] py-[0.875rem]">
        {categories.map((cat) => (
          <li key={cat.value}>
            <button
              type="button"
              onClick={() => onSelect(cat.value)}
              className={cn(
                'text-sm leading-[1.375rem] text-text-primary',
                selected === cat.value ? 'font-bold' : 'font-medium',
              )}
            >
              {cat.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export { CategorySidebar }

'use client'

import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'
import { CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

const CATEGORIES: AnimalCategory[] = ['all', 'dog', 'cat', 'lizard']

/* 모바일: h78 w158 rounded6 gap17(1.0625rem), 데스크탑: h124 flex-1 rounded16 gap12(0.75rem) */
const tabVariants = tv({
  base: 'flex items-center justify-center text-[0.875rem] font-semibold text-[#5d5d5d] transition-colors rounded-[0.375rem] h-[4.875rem] tab:rounded-[1rem] tab:h-[7.75rem]',
  variants: {
    active: {
      true: 'bg-[#c6c6c6]',
      false: 'border border-[#c6c6c6]',
    },
  },
})

interface CategoryFilterProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    /* 모바일: 2열 2행 그리드 gap 10/17px, 데스크탑: 4열 1행 gap 12px */
    <div
      className={cn(
        'grid grid-cols-2 gap-x-[1.0625rem] gap-y-[0.625rem] tab:grid-cols-4 tab:gap-[0.75rem]',
        className,
      )}
    >
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={tabVariants({ active: selected === category })}
          onClick={() => onChange(category)}
        >
          {CATEGORY_LABEL[category]}
        </button>
      ))}
    </div>
  )
}

export { CategoryFilter }

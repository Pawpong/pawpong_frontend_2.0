'use client'

import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'
import type { AnimalCategory } from '@/shared/types'

const CATEGORIES: AnimalCategory[] = ['전체', '강아지', '고양이', '도마뱀']

const tabVariants = tv({
  base: 'flex flex-1 items-center justify-center rounded-[1rem] px-[0.625rem] py-[0.625rem] text-[0.875rem] font-semibold text-[#5d5d5d] transition-colors tab:h-[7.75rem]',
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
    <div className={cn('flex gap-[0.75rem]', className)}>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          className={tabVariants({ active: selected === category })}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export { CategoryFilter }

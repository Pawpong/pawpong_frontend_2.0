'use client'

import { CategoryFilter } from './CategoryFilter'
import type { AnimalCategory } from '@/shared/types'

interface CategorySectionProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
}

const CategorySection = ({ selected, onChange }: CategorySectionProps) => (
  <div className="flex flex-col items-center justify-center pb-3 tab:pb-5 pc:pb-8">
    <CategoryFilter selected={selected} onChange={onChange} />
  </div>
)

export { CategorySection }

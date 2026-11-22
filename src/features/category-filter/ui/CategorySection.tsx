'use client'

import { CategoryFilter } from './CategoryFilter'
import type { AnimalCategory } from '@/shared/types'

interface CategorySectionProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
}

const CategorySection = ({ selected, onChange }: CategorySectionProps) => (
  // 위 여백은 탭 바 아래 공통 여백(--page-pad-top)이 맡는다
  <div className="flex flex-col items-center justify-center pb-1.5">
    <CategoryFilter selected={selected} onChange={onChange} />
  </div>
)

export { CategorySection }

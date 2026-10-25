'use client'

import { Container } from '@/shared/ui'
import { CategoryFilter } from './CategoryFilter'
import type { AnimalCategory } from '@/shared/types'

interface CategorySectionProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
}

const CategorySection = ({ selected, onChange }: CategorySectionProps) => (
  <Container className="flex flex-col items-center justify-center px-4 py-3 tab:py-5 pc:py-8">
    <CategoryFilter selected={selected} onChange={onChange} />
  </Container>
)

export { CategorySection }

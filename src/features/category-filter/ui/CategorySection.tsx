'use client'

import { Container } from '@/shared/ui'
import { CategoryFilter } from './CategoryFilter'
import type { AnimalCategory } from '@/shared/types'

interface CategorySectionProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
}

// 픽셀 카테고리 필터 섹션 (Figma 940-32969) — 가운데 정렬
// padding: 세로 tab 32px(spacing/32) → pc 48px(spacing/48), 가로 Container 기준 tab 48px(margin/tab) / pc 80px(margin/pc)
const CategorySection = ({ selected, onChange }: CategorySectionProps) => (
  <Container className="flex flex-col items-center justify-center py-8 pc:py-12">
    <CategoryFilter selected={selected} onChange={onChange} />
  </Container>
)

export { CategorySection }

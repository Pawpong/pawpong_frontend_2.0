'use client'

import { Container } from '@/shared/ui'
import { CategoryFilter } from './CategoryFilter'
import type { AnimalCategory } from '@/shared/types'

interface CategorySectionProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
}

// 픽셀 카테고리 필터 섹션 (Figma 940-32969) — 가운데 정렬
// padding 세로: mo 24px(spacing/24) → tab 32px(spacing/32) → pc 48px(spacing/48)
// padding 가로: mo 16px(margin/mo) → tab 48px(margin/tab) → pc 80px(margin/pc)
// 모바일 2x2 (gap 20px, medium 픽셀 버튼) / tab+ 4열
const CategorySection = ({ selected, onChange }: CategorySectionProps) => (
  <Container className="flex flex-col items-center justify-center px-4 py-6 tab:py-8 pc:py-12">
    <CategoryFilter selected={selected} onChange={onChange} className="gap-y-5 tab:gap-y-0" />
  </Container>
)

export { CategorySection }

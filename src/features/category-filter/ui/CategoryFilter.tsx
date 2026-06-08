'use client'

import { cn } from '@/shared/lib/cn'
import { PixelCategoryButton, PIXEL_CATEGORY_GRID } from '@/shared/ui'
import { CATEGORY_LABEL, ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

const INACTIVE_SRC = '/images/category/btn-pixel-category-inactive.svg'

interface CategoryFilterProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    /* 모바일 2열 / 데스크탑 4열, 픽셀 SVG 배경 위에 라벨 */
    // [refactored] 픽셀 버튼을 공통 PixelCategoryButton으로 위임
    <div className={cn(PIXEL_CATEGORY_GRID, className)}>
      {ANIMAL_CATEGORIES.map((category) => (
        <PixelCategoryButton
          key={category}
          label={CATEGORY_LABEL[category]}
          active={selected === category}
          defaultSrc={INACTIVE_SRC}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  )
}

export { CategoryFilter }

'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { CATEGORY_LABEL, ANIMAL_CATEGORIES } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

// Figma: 픽셀 버튼 — 활성 노랑(#FFFA94)+갈색 텍스트, 비활성 흰색+회색 텍스트
const ASSETS = {
  active: '/images/category/btn-pixel-category-active.svg',
  inactive: '/images/category/btn-pixel-category-inactive.svg',
}

interface CategoryFilterProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    /* 모바일 2열 / 데스크탑 4열, 픽셀 SVG 배경 위에 라벨 */
    <div
      className={cn(
        'mx-auto grid w-fit grid-cols-2 gap-x-[1.25rem] gap-y-[0.5rem] tab:grid-cols-4 tab:gap-y-0 pc:gap-x-[2rem]',
        className,
      )}
    >
      {ANIMAL_CATEGORIES.map((category) => {
        const active = selected === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className="relative flex h-[2.125rem] w-[6.640625rem] items-center justify-center p-[0.5rem] transition-transform hover:scale-105 pc:h-[3.8371rem] pc:w-[11.990875rem]"
          >
            <Image
              src={active ? ASSETS.active : ASSETS.inactive}
              alt=""
              fill
              className="object-fill"
            />
            <span
              className={cn(
                cafe24Proup.className,
                'relative z-10 font-cafe24 text-[0.625rem] leading-[1.5] font-normal whitespace-nowrap pc:text-[1rem]',
                active ? 'text-[#a9835a]' : 'text-[#6b6b6b]',
              )}
            >
              {CATEGORY_LABEL[category]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { CategoryFilter }

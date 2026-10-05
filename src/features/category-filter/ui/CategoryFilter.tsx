'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { ANIMAL_CATEGORIES, CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

// 카테고리별 완성 칩 SVG (기본/선택).
// 칩은 동물머리+pill+라벨이 한 장에 포함 — 높이는 pill이 하단에 정렬되도록 items-end + uniform scale.
// 모바일은 2×2 — 칩마다 비율이 달라 칸 폭이 아니라 pc 높이 × 0.6 으로 같은 배율을 줘 크기를 맞춘다.
// tab(768~)은 시안 3406-739490 기준 한 줄 568px — pc 대비 0.562배로 축소(gap 22 → 12).
const CHIP: Record<AnimalCategory, { src: string; on: string; ratio: string; height: string }> = {
  all: {
    src: '/images/category/filter-all.svg',
    on: '/images/category/filter-all-active.svg',
    ratio: 'aspect-[237/62]',
    height: 'h-[2.325rem] tab:h-[2.1875rem] pc:h-[3.875rem]',
  },
  dog: {
    src: '/images/category/filter-dog.svg',
    on: '/images/category/filter-dog-active.svg',
    ratio: 'aspect-[237/97]',
    height: 'h-[3.6375rem] tab:h-[3.40625rem] pc:h-[6.0625rem]',
  },
  cat: {
    src: '/images/category/filter-cat.svg',
    on: '/images/category/filter-cat-active.svg',
    ratio: 'aspect-[225/100]',
    height: 'h-[3.75rem] tab:h-[3.5rem] pc:h-[6.25rem]',
  },
  lizard: {
    src: '/images/category/filter-lizard.svg',
    on: '/images/category/filter-lizard-active.svg',
    ratio: 'aspect-[237/99]',
    height: 'h-[3.7125rem] tab:h-[3.46875rem] pc:h-[6.1875rem]',
  },
}

interface CategoryFilterProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    <div
      className={cn(
        // 모바일 2×2(같은 줄 칩은 pill 하단 정렬) → tab+ 한 줄
        'grid w-full grid-cols-2 items-end justify-items-center gap-x-2 gap-y-3 tab:flex tab:flex-wrap tab:justify-center tab:gap-x-3',
        className,
      )}
    >
      {ANIMAL_CATEGORIES.map((category) => {
        const chip = CHIP[category]
        const active = selected === category

        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            aria-label={CATEGORY_LABEL[category]}
            onClick={() => onChange(category)}
            className={cn('relative max-w-full shrink-0 focus-ring', chip.height, chip.ratio)}
          >
            {/* 라벨은 button의 aria-label이 담당 — 이미지는 장식 */}
            <Image
              src={active ? chip.on : chip.src}
              alt=""
              fill
              sizes="(min-width: 1440px) 240px, 170px"
              loading="eager"
              className="object-contain"
            />
          </button>
        )
      })}
    </div>
  )
}

export { CategoryFilter }

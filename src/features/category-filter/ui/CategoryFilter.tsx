'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/cn'
import { ANIMAL_CATEGORIES, CATEGORY_LABEL } from '@/shared/types'
import type { AnimalCategory } from '@/shared/types'

const CATEGORY_ICON: Record<AnimalCategory, string> = {
  all: '/images/category/cta-paw.svg',
  cat: '/images/community/face-cat.png',
  dog: '/images/community/face-dog.png',
  lizard: '/images/community/face-lizard.png',
}

interface CategoryFilterProps {
  selected: AnimalCategory
  onChange: (category: AnimalCategory) => void
  className?: string
}

// 탐색 1차 분류 (Option 3) — 46px 원 + 11px 라벨.
// 활성은 테두리가 아니라 면을 바꿔(버터 면 + 링) 1차 선택으로 읽히게 한다. 2차 필터는 테두리 칩이라 무게가 갈린다.
const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    <div
      role="group"
      aria-label="동물 분류"
      className={cn('grid w-full max-w-[24rem] grid-cols-4 gap-1', className)}
    >
      {ANIMAL_CATEGORIES.map((category) => {
        const active = selected === category

        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
            className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl focus-ring"
          >
            <span
              className={cn(
                'flex size-[2.875rem] items-center justify-center rounded-full border-[0.09375rem] transition-colors',
                active
                  ? 'border-secondary-500 bg-secondary-300'
                  : 'border-transparent bg-neutral-100 group-hover:bg-neutral-150',
              )}
            >
              <Image
                src={CATEGORY_ICON[category]}
                alt=""
                width={26}
                height={26}
                sizes="26px"
                loading="eager"
                className="size-[1.625rem] object-contain"
              />
            </span>
            <span
              className={cn(
                'text-[0.6875rem] leading-none transition-colors',
                active ? 'font-bold text-neutral-850' : 'font-semibold text-neutral-700',
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

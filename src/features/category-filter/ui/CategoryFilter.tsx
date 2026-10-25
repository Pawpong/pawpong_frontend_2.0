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

const CategoryFilter = ({ selected, onChange, className }: CategoryFilterProps) => {
  return (
    <div className={cn('grid w-full max-w-[24rem] grid-cols-4 gap-2 tab:gap-4', className)}>
      {ANIMAL_CATEGORIES.map((category) => {
        const active = selected === category

        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
            className={cn(
              'flex min-w-0 flex-col items-center gap-1 rounded-2xl py-1 text-sm focus-ring',
              active ? 'font-semibold text-brand' : 'text-text-primary hover:text-brand',
            )}
          >
            <span
              className={cn(
                'flex size-16 items-center justify-center rounded-full border tab:size-18',
                active ? 'border-primary-200 bg-brand-subtle' : 'border-transparent',
              )}
            >
              <Image
                src={CATEGORY_ICON[category]}
                alt=""
                width={48}
                height={48}
                sizes="48px"
                loading="eager"
                className={cn('size-12 object-contain', category === 'all' && 'size-8')}
              />
            </span>
            <span>{CATEGORY_LABEL[category]}</span>
          </button>
        )
      })}
    </div>
  )
}

export { CategoryFilter }

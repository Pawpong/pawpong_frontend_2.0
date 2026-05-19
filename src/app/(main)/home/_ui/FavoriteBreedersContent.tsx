'use client'

import { useState } from 'react'
import { LockIcon, ChevronDownIcon } from '@/shared/assets/icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import { MOCK_FAVORITE_BREEDERS } from '@/shared/mocks/myHome'
import { BreederCard } from './BreederCard'

const FILTER_OPTIONS = [
  { id: 'private', label: '나만보기' },
  { id: 'all', label: '전체보기' },
  { id: 'followers', label: '팔로워만 보기' },
] as const

type FilterType = (typeof FILTER_OPTIONS)[number]['id']

const FavoriteBreedersContent = () => {
  const breeders = MOCK_FAVORITE_BREEDERS
  const [activeFilter, setActiveFilter] = useState<FilterType>('private')

  const activeLabel = FILTER_OPTIONS.find((o) => o.id === activeFilter)?.label

  return (
    <div className="flex flex-col">
      {/* Filter Dropdown */}
      <div className="px-4 pt-4 tab:px-[6.25rem] tab:pt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-6 items-center gap-1 rounded-full bg-text-primary px-[0.625rem] py-[0.25rem] tab:h-auto tab:gap-2.5 tab:rounded-md tab:px-5 tab:py-3"
            >
              <span className="text-xs font-semibold leading-[1.375rem] text-white tab:text-base tab:font-bold">
                {activeLabel}
              </span>
              <LockIcon className="size-4 text-white tab:size-5" />
              <ChevronDownIcon className="size-4 text-white transition-transform tab:size-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="min-w-[8rem] rounded-md p-0">
            {FILTER_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${
                  activeFilter === option.id
                    ? 'bg-surface-primary text-text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Breeder Cards */}
      <div className="mt-4 flex flex-wrap justify-between gap-y-4 px-4 pb-4 tab:mt-[1.423rem] tab:flex-nowrap tab:justify-start tab:gap-[1.156rem] tab:overflow-x-auto tab:px-[6.25rem]">
        {breeders.map((breeder) => (
          <BreederCard key={breeder.id} breeder={breeder} />
        ))}
      </div>
    </div>
  )
}

export { FavoriteBreedersContent }

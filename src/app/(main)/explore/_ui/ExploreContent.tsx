'use client'

import { useState } from 'react'
import { SectionHeader } from '@/shared/ui'
import { SearchBar, PopularKeywords } from '@/features/search'
import { CategoryFilter } from '@/features/category-filter'
import { AdoptionCard } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import type { AnimalCategory } from '@/shared/types'

const mockListings = createMockListings()
const popularListings = mockListings.filter((l) => l.isPopular)

const ExploreContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory>('전체')

  return (
    <div className="flex flex-col">
      {/* 카테고리 필터 */}
      <CategoryFilter
        selected={selectedCategory}
        onChange={setSelectedCategory}
        className="mt-[1.5rem] tab:mt-[2rem]"
      />

      {/* 타이틀 */}
      <p className="mt-[1.5rem] text-[0.875rem] font-semibold text-[#5d5d5d] tab:mt-[2.5rem] tab:text-[1rem]">
        입양 상담까지 안전하게 이어가세요
      </p>

      {/* 검색바 + 인기 검색어 */}
      <div className="mx-auto mt-[1rem] w-full max-w-[42.5rem]">
        <SearchBar />
        <PopularKeywords />
      </div>

      {/* 인기 있는 동물들 */}
      <section className="mt-[3rem] flex flex-col gap-[1.25rem] tab:mt-[4rem]">
        <SectionHeader title="인기 있는 동물들" />
        <div className="grid grid-cols-1 gap-[1rem] tab:grid-cols-3 tab:gap-[1.125rem]">
          {popularListings.map((listing) => (
            <AdoptionCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      </section>

      {/* 전체 입양 소식 */}
      <section className="mt-[3rem] flex flex-col gap-[1.25rem] tab:mt-[4rem]">
        <div className="flex items-center gap-[0.375rem]">
          <span className="text-[1rem] font-semibold text-[#5d5d5d]">
            전체 입양 소식
          </span>
          <span className="text-[1rem] font-semibold text-[#acacac]">
            {mockListings.length}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-[1rem] tab:grid-cols-3 tab:gap-[1.125rem]">
          {mockListings.map((listing) => (
            <AdoptionCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      </section>

      {/* 하단 여백 */}
      <div className="h-[4rem]" />
    </div>
  )
}

export { ExploreContent }

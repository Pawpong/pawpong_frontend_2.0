'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/Cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { SectionHeader } from '@/shared/ui'
import { SearchBar, PopularKeywords } from '@/features/search'
import { BreederCard } from '@/app/(main)/home/_ui/BreederCard'
import { BreederCardHorizontal } from './BreederCardHorizontal'
import {
  MOCK_FEATURED_BREEDERS,
  MOCK_EXPLORE_BREEDERS,
} from '@/shared/mocks/breederExplore'

const BreederExploreContent = () => {
  const [featuredCollapsed, setFeaturedCollapsed] = useState(false)
  const [exploreCollapsed, setExploreCollapsed] = useState(false)

  return (
    <>
      {/* 타이틀 — 모바일: cafe24 14px, 데스크탑: Pretendard Bold 20px */}
      <p
        className={cn(
          cafe24Proup.className,
          'py-5 text-center font-cafe24 text-[0.875rem] leading-[1.5] text-[#5d5d5d] tab:hidden',
        )}
      >
        신뢰있는 브리더들을 만나보세요
      </p>
      <p className="hidden px-[6.25rem] py-[0.625rem] text-center text-[1.25rem] font-bold leading-[1.375rem] text-[#5d5d5d] tab:mt-[2.188rem] tab:block">
        신뢰있는 브리더들을 만나보세요
      </p>

      {/* 검색바 + 인기 검색어 */}
      <div className="w-full tab:mx-auto tab:mt-[1.25rem] tab:max-w-[42.5rem]">
        <SearchBar
          placeholder={{
            mobile: '아무거나 검색해보세요',
            desktop: '브리더를 통해 알고싶은게 있나요?',
          }}
        />
        <PopularKeywords />
      </div>

      {/* 주목할 브리더 */}
      <section className="mt-[2.063rem] flex flex-col gap-[0.75rem] tab:mt-[4rem] tab:gap-[1.25rem]">
        <SectionHeader
          title={`주목할 브리더 ${MOCK_FEATURED_BREEDERS.length}`}
          collapsible
          collapsed={featuredCollapsed}
          onToggle={() => setFeaturedCollapsed((prev) => !prev)}
        />
        {!featuredCollapsed && (
          <>
            {/* 모바일: 가로형 카드 리스트 */}
            <div className="flex flex-col gap-[0.75rem] tab:hidden">
              {MOCK_FEATURED_BREEDERS.map((breeder) => (
                <BreederCardHorizontal key={breeder.id} breeder={breeder} />
              ))}
            </div>
            {/* 데스크탑: 3열 세로형 카드 */}
            <div className="hidden tab:grid tab:grid-cols-3 tab:gap-[1.156rem]">
              {MOCK_FEATURED_BREEDERS.map((breeder) => (
                <BreederCard
                  key={breeder.id}
                  breeder={breeder}
                  showPopularBadge
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 전체 입양 소식 */}
      <section className="mt-[1.25rem] flex flex-col gap-[0.75rem] tab:mt-[4rem] tab:gap-[1.25rem]">
        <SectionHeader
          title={`전체 입양 소식 ${MOCK_EXPLORE_BREEDERS.length}`}
          collapsible
          collapsed={exploreCollapsed}
          onToggle={() => setExploreCollapsed((prev) => !prev)}
        />
        {!exploreCollapsed && (
          <div className="grid grid-cols-2 gap-[0.97rem] tab:grid-cols-3 tab:gap-[1.156rem]">
            {MOCK_EXPLORE_BREEDERS.map((breeder) => (
              <BreederCard key={breeder.id} breeder={breeder} />
            ))}
          </div>
        )}
      </section>

      {/* 하단 여백 */}
      <div className="h-[4rem]" />
    </>
  )
}

export { BreederExploreContent }

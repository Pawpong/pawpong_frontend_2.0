'use client'

import { useState } from 'react'
import { SectionHeader } from '@/shared/ui'
import { AdoptionCard } from '@/entities/adoption'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'

// [refactored] 두 카드 섹션에서 반복되던 스타일을 상수로 추출
const SECTION_BASE = 'flex flex-col gap-[0.75rem] tab:mt-[2.5rem] tab:px-[2rem] pc:px-0' // tab 좌우 80px = Container 48 + 32, pc 리셋
const SECTION_TITLE = 'font-semibold text-[#3e3e3e] tab:text-base' // Figma body/large/bold #3e3e3e
const CARD_GRID = 'grid grid-cols-2 gap-[0.97rem] tab:gap-[1.25rem] pc:grid-cols-4' // mo·tab 2열 / pc 4열

interface AdoptionListingSectionProps {
  /** 섹션 라벨 (개수는 listings.length로 자동 부착) */
  title: string
  listings: AdoptionListingCard[]
  /** 섹션 상단 여백 등 추가 클래스 */
  className?: string
}

// [refactored] 인기 동물 / 전체 입양 소식 섹션을 하나의 컴포넌트로 통합 (collapse 상태 내부 관리)
const AdoptionListingSection = ({ title, listings, className }: AdoptionListingSectionProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className={cn(SECTION_BASE, className)}>
      <SectionHeader
        title={`${title} ${listings.length}`}
        titleClassName={SECTION_TITLE}
        collapsible
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      {!collapsed && (
        <div className={CARD_GRID}>
          {listings.map((listing) => (
            <AdoptionCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      )}
    </section>
  )
}

export { AdoptionListingSection }

'use client'

import { Container, LabelTextButton } from '@/shared/ui'
import { FavoriteAdoptionCard } from '@/features/adoption'
import type { AdoptionListingCard } from '@/shared/types'

interface FavoritesTabProps {
  listings: AdoptionListingCard[]
}

const FavoritesTab = ({ listings }: FavoritesTabProps) => (
  // 섹션 패딩을 Container로 일원화 (세로 20/40/40 · 가로 16/48/80, 모바일만 기본값 20→16 오버라이드)
  // 헤더-그리드 간격은 gap으로 (모바일 10px / tab 12px)
  <Container className="flex flex-col gap-2.5 px-4 py-5 tab:gap-3 tab:py-10">
    {/* 라벨 사이즈: 반응형 토큰 text-body-s (모바일 14 → tab+ 16) */}
    <LabelTextButton
      labelClassName="text-body-s"
      label={`입양 관심 목록 ${listings.length}`}
      actionLabel="입양 탐색"
      href="/adoption"
    />

    {/* 카드 그리드 — mo·tab 2열 / pc 4열.
        tab은 좌우 mx-44px(Container 위 추가 여백)로 카드 282px 고정, pc는 max-w+mx-auto로 가운데 정렬 */}
    <div className="grid grid-cols-2 gap-4 tab:mx-[2.75rem] tab:gap-5 pc:mx-auto pc:max-w-[74.25rem] pc:grid-cols-4">
      {listings.map((listing) => (
        <FavoriteAdoptionCard key={listing.listingId} listing={listing} />
      ))}
    </div>
  </Container>
)

export { FavoritesTab }

'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { ListState, ShowcaseSection } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4

const AdoptionShowcase = () => {
  // 홈 섹션은 비필수 — 실패해도 페이지는 렌더되어야 하므로 바운더리로 던지지 않음
  const { data, isPending, isError } = useInfiniteQuery({
    ...adoptionQueries.list('latest', undefined, 'available', undefined, CARD_COUNT),
    throwOnError: false,
  })
  const pets = flattenPages(data).slice(0, CARD_COUNT).map(mapAdoptionCard)

  return (
    <ShowcaseSection title="분양중인 동물" linkText="탐색 바로가기" linkHref="/explore">
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={pets.length === 0}
        loadingText="분양중인 동물을 불러오는 중입니다."
        errorText="분양중인 동물을 불러오지 못했습니다."
        emptyText="현재 분양중인 동물이 없습니다."
      >
        {/* Figma: mo 164×2 / tab 164×4에서 시작해 pc 282×4까지 자연스럽게 보간.
            grid에 자체 max-w를 두면 섹션 타이틀(Container 폭 그대로)과 좌우 여백이 어긋난다 —
            fr 컬럼으로 Container 폭에 맞춰 늘어나게 둔다. */}
        <div className="grid w-full grid-cols-2 gap-x-[0.9375rem] gap-y-5 tab:grid-cols-4 tab:gap-x-[clamp(0.333rem,calc(7.456vw-3.246rem),3.167rem)] tab:gap-y-0">
          {pets.map((listing, index) => (
            <FavoriteAdoptionShowcaseCard
              key={listing.listingId}
              listing={listing}
              preload={index === 0}
            />
          ))}
        </div>
      </ListState>
    </ShowcaseSection>
  )
}

export { AdoptionShowcase }

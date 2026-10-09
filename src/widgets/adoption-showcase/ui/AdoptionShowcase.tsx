'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { ListState, ShowcaseSection } from '@/shared/ui'
import { SkeletonBlock } from '@/shared/ui/Skeleton'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4
// 불러온 카드와 같은 격자를 스켈레톤과 함께 쓴다.
const GRID_CLASS =
  'grid w-full grid-cols-2 gap-x-[0.9375rem] gap-y-5 tab:grid-cols-4 tab:gap-x-[clamp(0.333rem,calc(7.456vw-3.246rem),3.167rem)] tab:gap-y-0'

const AdoptionShowcase = () => {
  // 홈 섹션은 비필수 — 실패해도 페이지는 렌더되어야 하므로 바운더리로 던지지 않음
  const { data, isPending, isError } = useInfiniteQuery({
    ...adoptionQueries.list('latest', undefined, 'available', undefined, CARD_COUNT),
    throwOnError: false,
  })
  const pets = flattenPages(data).slice(0, CARD_COUNT).map(mapAdoptionCard)

  return (
    <ShowcaseSection
      title="분양중인 동물"
      linkText="탐색 바로가기"
      linkHref="/explore?type=adoption"
    >
      <ListState
        appPublicContent
        isPending={isPending}
        isError={isError}
        isEmpty={pets.length === 0}
        loadingText="분양중인 동물을 불러오는 중이에요."
        loadingFallback={
          <div role="status" aria-busy="true">
            <span className="sr-only">분양중인 동물을 불러오는 중이에요.</span>
            <div className={GRID_CLASS} aria-hidden>
              {Array.from({ length: CARD_COUNT }, (_, index) => (
                <div key={index}>
                  <SkeletonBlock className="aspect-[348/284] w-full rounded pc:rounded-lg" />
                  <div className="space-y-2 p-2 pc:p-3">
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                    <SkeletonBlock className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        errorText="분양중인 동물을 불러오지 못했어요."
        emptyText="현재 분양중인 동물이 없어요."
      >
        {/* Figma: mo 164×2 / tab 164×4에서 시작해 pc 282×4까지 자연스럽게 보간.
            grid에 자체 max-w를 두면 섹션 타이틀(Container 폭 그대로)과 좌우 여백이 어긋난다 —
            fr 컬럼으로 Container 폭에 맞춰 늘어나게 둔다. */}
        <div className={GRID_CLASS}>
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

'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import {
  CommunityMediaCard,
  communityQueries,
  formatHallOfFamePeriod,
  getFirstPhotoPostId,
  toCommunityPreviewProps,
} from '@/entities/community'
import { ArchHallOfFame } from './ArchHallOfFame'
import { HomeSectionHeader } from './HomeSectionHeader'
import { FavoriteAdoptionGridCard } from '@/features/adoption'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { ListingCardGrid, ListingCardGridSkeleton, ListState } from '@/shared/ui'
import { CARE_FEATURES, usePlayFeatures } from '../../(page)/playground/_ui/PlaygroundContent'
import { PlaygroundFeatureCards } from '../../(page)/playground/_ui/PlaygroundFeatureRail'

const PET_COUNT = 5
// 기존 홈 AdoptionShowcase 와 같은 규칙 — 1024px 부터 공통 격자 5열 한 줄, 그보다 좁으면 4장만.
const PET_GRID = 'tab:grid-cols-4 max-lap:[&>*:nth-child(5)]:hidden'

export function PreviewPets({ title = '지금 만날 수 있는 친구들' }: { title?: string }) {
  const { data, isPending, isError } = useInfiniteQuery({
    ...adoptionQueries.list('latest', undefined, 'available', undefined, PET_COUNT),
    throwOnError: false,
  })
  const pets = flattenPages(data).slice(0, PET_COUNT).map(mapAdoptionCard)

  return (
    <section aria-labelledby="preview-pets-title" className="page-shell">
      <HomeSectionHeader
        id="preview-pets-title"
        title={title}
        href="/explore?type=adoption"
        linkLabel="전체 보기"
      />
      <ListState
        appPublicContent
        isPending={isPending}
        isError={isError}
        isEmpty={pets.length === 0}
        loadingText="친구들을 불러오는 중이에요."
        loadingFallback={
          <ListingCardGridSkeleton
            label="친구들을 불러오는 중이에요."
            count={PET_COUNT}
            className={PET_GRID}
          />
        }
        errorText="친구들을 불러오지 못했어요."
        emptyText="지금 소개 중인 친구가 없어요."
      >
        <ListingCardGrid
          className={PET_GRID}
          items={pets}
          getKey={(pet) => pet.listingId}
          renderItem={(pet, index) => (
            <FavoriteAdoptionGridCard listing={pet} preload={index === 0} />
          )}
        />
      </ListState>
    </section>
  )
}

export function PreviewCommunity() {
  const { data, isPending, isError } = useInfiniteQuery({
    ...communityQueries.posts('latest', undefined, undefined, undefined, 4),
    throwOnError: false,
  })
  const posts = flattenPages(data).slice(0, 4)
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  return (
    <section aria-labelledby="preview-community-title" className="page-shell">
      <HomeSectionHeader
        id="preview-community-title"
        title="함께 살아가는 이야기"
        description="새 가족을 만난 뒤의 일상도 포퐁에서 이어져요."
        href="/community"
        linkLabel="커뮤니티 보기"
      />
      <ListState
        appPublicContent
        isPending={isPending}
        isError={isError}
        isEmpty={posts.length === 0}
        loadingText="이야기를 불러오는 중이에요."
        loadingFallback={
          <div
            role="status"
            className="grid grid-cols-2 gap-3 tab:grid-cols-4"
            aria-label="이야기를 불러오는 중이에요."
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-square rounded-lg bg-neutral-100" />
            ))}
          </div>
        }
        errorText="이야기를 불러오지 못했어요."
        emptyText="아직 공개된 이야기가 없어요."
      >
        <div className="grid grid-cols-2 gap-3 tab:grid-cols-4 tab:gap-5">
          {posts.map((post) => {
            const preview = toCommunityPreviewProps(post)
            return (
              <CommunityMediaCard
                key={preview.postId}
                href={preview.detailHref ?? `/community/post/${preview.postId}`}
                imageUrl={preview.images?.[0]}
                imageCount={preview.images?.length ?? 0}
                alt={`${preview.author.nickname}의 게시글 이미지`}
                preload={preview.postId === firstPhotoPostId}
              />
            )
          })}
        </div>
      </ListState>
    </section>
  )
}

/** 놀이터 카드 줄 — 썸네일은 D(배너 캐릭터)로 정했다 */
export function PreviewPlayground() {
  const playFeatures = usePlayFeatures()
  return (
    <section aria-labelledby="preview-playground-title" className="page-shell">
      <HomeSectionHeader
        id="preview-playground-title"
        title="포퐁 놀이터"
        description="우리 아이와 함께할 작은 즐거움을 골라보세요."
        href="/playground"
        linkLabel="놀이터 가기"
      />
      <PlaygroundFeatureCards items={[...playFeatures, ...CARE_FEATURES]} />
    </section>
  )
}

export function PreviewHallOfFame() {
  const current = useQuery({ ...communityQueries.hallOfFameCurrent(), throwOnError: false })
  const isCurrentEmpty =
    current.data?.winners.length === 0 && !current.data?.unavailableRanks?.length
  const history = useInfiniteQuery({
    ...communityQueries.hallOfFameHistory(4),
    enabled: isCurrentEmpty,
    throwOnError: false,
  })
  const result = isCurrentEmpty
    ? flattenPages(history.data).find(
        (period) => period.winners.length > 0 || Boolean(period.unavailableRanks?.length),
      )
    : current.data
  const hasWinners = Boolean(
    result && (result.winners.length > 0 || result.unavailableRanks?.length),
  )
  return (
    <section className="page-shell" aria-labelledby="preview-hall-title">
      <HomeSectionHeader
        id="preview-hall-title"
        title="명예의 동물들"
        description={
          <>
            {isCurrentEmpty
              ? '지난 회차의 주인공들을 소개해요.'
              : '이번 회차의 주인공들을 소개해요.'}
            {hasWinners && result && (
              <span className="block">{formatHallOfFamePeriod(result).summary}</span>
            )}
          </>
        }
        href="/hall-of-fame"
        linkLabel="명예의 전당 둘러보기"
      />
      <ListState
        isPending={current.isPending || Boolean(isCurrentEmpty && history.isPending)}
        isError={current.isError || history.isError}
        isEmpty={!hasWinners}
        loadingText="명예의 동물을 불러오는 중이에요."
        errorText="명예의 동물을 불러오지 못했어요."
        emptyText="아직 선정된 명예의 동물이 없어요."
      >
        <ArchHallOfFame
          winners={result?.winners ?? []}
          state={result?.state ?? 'open'}
          unavailableRanks={result?.unavailableRanks}
        />
      </ListState>
    </section>
  )
}

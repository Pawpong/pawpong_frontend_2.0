'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { communityQueries, toCommunityPreviewProps } from '@/entities/community'
import { ConnectedPostCard } from '@/features/community'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'

const SavedFeedsTab = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(communityQueries.myBookmarks())

  const feeds = useMemo(
    () => dedupeBy(data?.pages.flatMap((page) => page.items) ?? [], (post) => post.postId),
    [data],
  )

  return (
    // 저장피드 전용 패딩 — 모바일 py48·px16 / tab 48 전방향 (tab px는 Container 기본 48)
    <Container className="px-4 py-12">
      {/* 각 피드가 개별 보더 카드 (Figma 2091-148897) — 카드 간 gap 모바일 20 / tab 28, tab max-w 59.25rem 가운데 */}
      <div className="flex flex-col gap-5 tab:mx-auto tab:max-w-[59.25rem] pc:gap-7">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={feeds.length === 0}
          loadingText="저장 피드를 불러오는 중입니다."
          errorText="저장 피드를 불러오지 못했습니다."
          emptyText="저장한 피드가 없습니다."
        >
          {feeds.map((post) => (
            <div key={post.postId} className="rounded-lg border border-neutral-300 bg-white">
              {/* 저장피드: ProfileHeader sm 헤더 + 모바일 좌우 패딩 보완(px-3) */}
              <ConnectedPostCard
                profileType="sm"
                className="px-3"
                {...toCommunityPreviewProps(post)}
              />
            </div>
          ))}
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { SavedFeedsTab }

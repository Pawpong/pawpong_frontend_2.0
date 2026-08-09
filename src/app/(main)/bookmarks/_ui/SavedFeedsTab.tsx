'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { communityQueries, PostCard, toCommunityPreviewProps } from '@/entities/community'
import { Container, InfiniteScrollTrigger } from '@/shared/ui'

const SavedFeedsTab = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    communityQueries.myBookmarks(),
  )

  const feeds = data?.pages.flatMap((page) => page.items) ?? []

  return (
    // 저장피드 전용 패딩 — 모바일 py48·px16 / tab 48 전방향 (tab px는 Container 기본 48)
    <Container className="px-4 py-12">
      {/* 각 피드가 개별 보더 카드 (Figma 2091-148897) — 카드 간 gap 모바일 20 / tab 28, tab max-w 59.25rem 가운데 */}
      <div className="flex flex-col gap-5 tab:mx-auto tab:max-w-[59.25rem] pc:gap-7">
        {feeds.map((post) => (
          <div key={post.postId} className="rounded-lg border border-neutral-300 bg-white">
            {/* 저장피드: ProfileHeader sm 헤더 + 모바일 좌우 패딩 보완(px-3) */}
            <PostCard profileType="sm" className="px-3" {...toCommunityPreviewProps(post)} />
          </div>
        ))}

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

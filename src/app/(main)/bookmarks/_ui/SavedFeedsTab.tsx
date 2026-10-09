'use client'

import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import { PostList } from '@/features/community'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { EmptyStateLink } from '@/shared/ui/EmptyStateLink'
import { ListRowsSkeleton } from '@/shared/ui/Skeleton'
import { flattenPages } from '@/shared/lib/infiniteList'

const SavedFeedsTab = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError } =
    useInfiniteQuery(communityQueries.myBookmarks())

  const feeds = useMemo(() => dedupeBy(flattenPages(data), (post) => post.postId), [data])

  return (
    // 마이홈 '내가 쓴 글'과 같은 목록 계약 — 공통 PostList 가 카드·폭·구분선을 소유한다
    <Container className="px-4 py-6 tab:py-10">
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={feeds.length === 0}
        loadingText="저장 피드를 불러오는 중이에요."
        loadingFallback={<ListRowsSkeleton label="저장 피드를 불러오는 중이에요." />}
        errorText="저장 피드를 불러오지 못했어요."
        emptyText="아직 저장한 피드가 없어요."
        emptyAction={<EmptyStateLink href="/community">커뮤니티 둘러보기</EmptyStateLink>}
      >
        <PostList posts={feeds} />
      </ListState>

      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Container>
  )
}

export { SavedFeedsTab }

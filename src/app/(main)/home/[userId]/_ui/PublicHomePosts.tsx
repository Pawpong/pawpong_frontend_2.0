'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { communityQueries } from '@/entities/community'
import { ListHeader, PageShell } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { HomePostGrid } from '../../_ui/HomePostGrid'

const HOME_POST_PAGE_SIZE = 30

interface PublicHomePostsProps {
  userId: string
  /** PC 2단 레이아웃 안에서는 페이지 좌우 패딩을 끈다 */
  className?: string
  /** 2단 레이아웃처럼 컬럼이 좁아지는 자리에서 고정폭 그리드 대신 쓴다 */
  gridClassName?: string
  /**
   * grid: 브리더 홈 피드 탭 — 모바일 꽉 찬 3열 사진 격자.
   * feed: 입양자 홈 — 탭 없이 구분선 아래 '피드 N' 머리 + 1열 피드 카드.
   */
  layout?: 'grid' | 'feed'
}

/** 입양자·브리더 공개 홈이 함께 쓰는 피드 데이터 섹션. */
const PublicHomePosts = ({
  userId,
  className,
  gridClassName,
  layout = 'grid',
}: PublicHomePostsProps) => {
  const query = useInfiniteQuery({
    ...communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const posts = dedupeBy(flattenPages(query.data), (post) => post.postId)
  const isFeed = layout === 'feed'

  return (
    <PageShell
      className={cn(
        isFeed
          ? 'border-t border-neutral-200 pt-5 pb-10 tab:border-t-0 tab:pt-0'
          : 'py-5 tab:pt-6 tab:pb-10 pc:py-10',
        className,
      )}
    >
      <HomePostGrid
        layout={layout}
        header={
          isFeed && (
            <ListHeader title="피드" count={query.data ? getTotalItems(query.data) : undefined} />
          )
        }
        posts={posts}
        isPending={query.isPending}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
        emptyText={isFeed ? '아직 올린 글이 없어요.' : undefined}
        pagination={{
          onLoadMore: () => void query.fetchNextPage(),
          hasNextPage: query.hasNextPage ?? false,
          isFetchingNextPage: query.isFetchingNextPage,
        }}
        gridClassName={gridClassName}
      />
    </PageShell>
  )
}

export { PublicHomePosts }

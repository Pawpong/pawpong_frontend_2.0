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
  /**
   * 탭이 없는 입양자 홈 — 구분선 아래 '피드 n건' 머리를 단다.
   * 브리더 홈은 '피드' 탭 안이라 탭 이름이 머리를 대신한다.
   */
  heading?: boolean
}

/** 입양자·브리더 공개 홈이 함께 쓰는 피드 — 마이홈과 같은 1열 피드 카드 목록. */
const PublicHomePosts = ({ userId, heading = false }: PublicHomePostsProps) => {
  const query = useInfiniteQuery({
    ...communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const posts = dedupeBy(flattenPages(query.data), (post) => post.postId)

  return (
    <PageShell
      className={cn(
        'pb-10',
        heading ? 'border-t border-neutral-200 pt-5 tab:border-t-0 tab:pt-0' : 'pt-5 tab:pt-6',
      )}
    >
      <HomePostGrid
        header={
          heading && (
            <ListHeader title="피드" count={query.data ? getTotalItems(query.data) : undefined} />
          )
        }
        posts={posts}
        isPending={query.isPending}
        isError={query.isError}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
        emptyText="아직 올린 글이 없어요."
        pagination={{
          onLoadMore: () => void query.fetchNextPage(),
          hasNextPage: query.hasNextPage ?? false,
          isFetchingNextPage: query.isFetchingNextPage,
        }}
      />
    </PageShell>
  )
}

export { PublicHomePosts }

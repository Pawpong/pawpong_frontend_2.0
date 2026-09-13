'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { communityQueries } from '@/entities/community'
import { HomePostGrid } from '../../_ui/HomePostGrid'

const HOME_POST_PAGE_SIZE = 30

interface PublicHomePostsProps {
  userId: string
  /** PC 2단 레이아웃 안에서는 페이지 좌우 패딩을 끈다 */
  className?: string
  /** 2단 레이아웃처럼 컬럼이 좁아지는 자리에서 고정폭 그리드 대신 쓴다 */
  gridClassName?: string
}

/** 입양자·브리더 공개 홈이 함께 쓰는 피드 데이터 섹션. */
const PublicHomePosts = ({ userId, className, gridClassName }: PublicHomePostsProps) => {
  const query = useInfiniteQuery({
    ...communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const posts = dedupeBy(flattenPages(query.data), (post) => post.postId)

  return (
    <HomePostGrid
      posts={posts}
      isPending={query.isPending}
      isError={query.isError}
      onRetry={() => void query.refetch()}
      pagination={{
        onLoadMore: () => void query.fetchNextPage(),
        hasNextPage: query.hasNextPage ?? false,
        isFetchingNextPage: query.isFetchingNextPage,
      }}
      className={className}
      gridClassName={gridClassName}
    />
  )
}

export { PublicHomePosts }

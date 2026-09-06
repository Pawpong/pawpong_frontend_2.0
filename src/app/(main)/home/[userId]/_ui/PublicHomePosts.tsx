'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { communityQueries } from '@/entities/community'
import { HomePostGrid } from '../../_ui/HomePostGrid'

const HOME_POST_PAGE_SIZE = 30

interface PublicHomePostsProps {
  userId: string
}

/** 입양자·브리더 공개 홈이 함께 쓰는 피드 데이터 섹션. */
const PublicHomePosts = ({ userId }: PublicHomePostsProps) => {
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
    />
  )
}

export { PublicHomePosts }

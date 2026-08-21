'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Container, InfiniteScrollTrigger, ListState, NavigationBar } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { adopterQueries } from '@/entities/adopter'
import { communityQueries } from '@/entities/community'
import { ProfileCard } from '../../_ui/ProfileCard'
import { PostList } from '../../_ui/PostList'

const HOME_POST_PAGE_SIZE = 30

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
  const { data: profile } = useQuery(adopterQueries.publicProfile(userId))
  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE))

  const posts = flattenPages(postsData)

  if (!profile) return null

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title={`${profile.nickname}의 홈`} />

      <Container className="px-4 py-5 tab:py-10">
        <ProfileCard profile={profile} mode="other" />
      </Container>

      {/* Figma 1023:22324 — 모바일 padding spacing/24 + margin/mo(16), 탭 이상은 spacing/40 */}
      <Container className="px-4 py-6 tab:py-10">
        <ListState
          isPending={isPostsPending}
          isError={isPostsError}
          isEmpty={posts.length === 0}
          loadingText="게시글을 불러오는 중입니다."
          errorText="게시글을 불러오지 못했습니다."
          emptyText="게시글이 없습니다."
        >
          <PostList posts={posts} />
        </ListState>
        <InfiniteScrollTrigger
          onIntersect={() => void fetchNextPage()}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      </Container>
    </div>
  )
}

export { UserHomeContent }

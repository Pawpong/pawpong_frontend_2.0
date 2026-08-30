'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  AsyncState,
  Button,
  Container,
  InfiniteScrollTrigger,
  ListState,
  NavigationBar,
} from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { adopterQueries } from '@/entities/adopter'
import { communityQueries } from '@/entities/community'
import { ProfileCard } from '../../_ui/ProfileCard'
import { PostList } from '../../_ui/PostList'

const HOME_POST_PAGE_SIZE = 30

interface UserHomeContentProps {
  userId: string
}

const UserHomeContent = ({ userId }: UserHomeContentProps) => {
  const profileQuery = useQuery({
    ...adopterQueries.publicProfile(userId),
    refetchOnMount: false,
    throwOnError: false,
  })
  const profile = profileQuery.data
  const {
    data: postsData,
    isPending: isPostsPending,
    isError: isPostsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    ...communityQueries.userPosts(userId, HOME_POST_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })

  // 무한스크롤 페이지 병합 시 postId 중복 제거 (React key 중복 방어)
  const posts = dedupeBy(flattenPages(postsData), (post) => post.postId)

  if (!profile) {
    return (
      <AsyncState
        status={profileQuery.isError ? 'error' : 'loading'}
        message={
          profileQuery.isError ? '프로필을 불러오지 못했습니다.' : '프로필을 불러오는 중입니다.'
        }
        action={
          profileQuery.isError ? (
            <Button variant="fill" size="sm" onClick={() => void profileQuery.refetch()}>
              다시 시도
            </Button>
          ) : undefined
        }
        className="min-h-[calc(100dvh-3.5rem)]"
      />
    )
  }

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
          errorAction={
            <Button variant="fill" size="sm" onClick={() => void refetchPosts()}>
              다시 시도
            </Button>
          }
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

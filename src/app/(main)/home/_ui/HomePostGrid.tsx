'use client'

import { useState } from 'react'
import { Button, Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { BREAKPOINTS } from '@/shared/lib/useBreakpoint'
import { CommunityMediaCard, getFirstPhotoPostId } from '@/entities/community'
import type { CommunityPostCard } from '@/shared/types'
import { HomePostDetailModal } from './HomePostDetailModal'

interface HomePostGridProps {
  posts: CommunityPostCard[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
  loadingText?: string
  errorText?: string
  emptyText?: string
  pagination?: {
    onLoadMore: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
  }
}

/** 모든 홈 화면에서 같은 카드 크기·상세 동작을 보장하는 게시글 그리드. */
const HomePostGrid = ({
  posts,
  isPending,
  isError,
  onRetry,
  loadingText = '게시글을 불러오는 중입니다.',
  errorText = '게시글을 불러오지 못했습니다.',
  emptyText = '게시글이 없습니다.',
  pagination,
}: HomePostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  return (
    <>
      <Container className="px-0 py-5 tab:px-0 tab:pt-6 tab:pb-10 pc:px-20 pc:py-10">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={posts.length === 0}
          loadingText={loadingText}
          errorText={errorText}
          emptyText={emptyText}
          errorAction={
            <Button variant="fill" size="sm" onClick={onRetry} className="px-4">
              다시 시도
            </Button>
          }
        >
          <div className="mx-auto grid w-full max-w-[23.4375rem] grid-cols-[repeat(3,7.625rem)] justify-between gap-y-3 tab:max-w-[48rem] tab:grid-cols-3 tab:gap-3 pc:max-w-[80rem] pc:grid-cols-[repeat(4,18.75rem)] pc:justify-center pc:gap-5">
            {posts.map((post) => (
              <CommunityMediaCard
                key={post.postId}
                href={`/community/post/${post.postId}`}
                imageUrl={post.primaryPhotoUrl ?? post.photoUrls[0]}
                imageCount={post.photoUrls.length}
                alt={post.title ?? post.bodyExcerpt ?? '게시글'}
                preload={post.postId === firstPhotoPostId}
                variant="profileGrid"
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey ||
                    !window.matchMedia(`(min-width: ${BREAKPOINTS.tab}px)`).matches
                  ) {
                    return
                  }

                  event.preventDefault()
                  setSelectedPostId(post.postId)
                }}
              />
            ))}
          </div>
        </ListState>
        {pagination && (
          <InfiniteScrollTrigger
            onIntersect={pagination.onLoadMore}
            hasNextPage={pagination.hasNextPage}
            isFetchingNextPage={pagination.isFetchingNextPage}
          />
        )}
      </Container>

      <HomePostDetailModal
        postId={selectedPostId}
        onOpenChange={(open) => !open && setSelectedPostId(null)}
      />
    </>
  )
}

export { HomePostGrid }

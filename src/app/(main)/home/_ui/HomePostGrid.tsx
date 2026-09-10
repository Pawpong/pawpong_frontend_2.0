'use client'

import { useState } from 'react'
import { Button, Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
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
  /** 바깥 Container 여백 조정 — 2단 레이아웃 컬럼 안에서는 페이지 좌우 패딩을 끈다 */
  className?: string
  /** 열 수·폭 상한 조정 — 컬럼이 좁아지면 고정폭 4열이 넘쳐 밖으로 삐져나간다 */
  gridClassName?: string
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
  className,
  gridClassName,
}: HomePostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  return (
    <>
      <Container
        className={cn('px-0 py-5 tab:pt-6 tab:pb-10 pc:page-gutter-x pc:py-10', className)}
      >
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
          <div
            className={cn(
              'mx-auto grid w-full max-w-[23.4375rem] grid-cols-[repeat(3,7.625rem)] justify-between gap-y-3 tab:max-w-[48rem] tab:grid-cols-3 tab:gap-3 pc:max-w-[80rem] pc:grid-cols-[repeat(4,18.75rem)] pc:justify-center pc:gap-5',
              gridClassName,
            )}
          >
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

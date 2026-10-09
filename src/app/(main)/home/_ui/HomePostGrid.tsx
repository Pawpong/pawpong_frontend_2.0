'use client'

import { useState, type ReactNode } from 'react'
import { Container, InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { GridSkeleton } from '@/shared/ui/Skeleton'
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
  isRetrying: boolean
  loadingText?: string
  errorText?: string
  emptyText?: string
  /** 빈 목록에서 다음 행동으로 잇는 버튼 */
  emptyAction?: ReactNode
  pagination?: {
    onLoadMore: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
  }
  /** 바깥 Container 여백 조정 — 2단 레이아웃 컬럼 안에서는 페이지 좌우 패딩을 끈다 */
  className?: string
  /** 열 수·폭 상한 조정 — 컬럼이 좁아지면 고정폭 4열이 넘쳐 밖으로 삐져나간다 */
  gridClassName?: string
  /** 그리드 위 보조 영역 (마이홈 보기 전환 칩) — 모바일 고정폭 그리드와 같은 폭에 맞춘다 */
  header?: ReactNode
}

/** 모든 홈 화면에서 같은 카드 크기·상세 동작을 보장하는 게시글 그리드. */
const HomePostGrid = ({
  posts,
  isPending,
  isError,
  onRetry,
  isRetrying,
  loadingText = '게시글을 불러오는 중이에요.',
  errorText = '게시글을 불러오지 못했어요.',
  emptyText = '게시글이 없어요.',
  emptyAction,
  pagination,
  className,
  gridClassName,
  header,
}: HomePostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const gridClasses = cn(
    'mx-auto grid w-full max-w-[23.4375rem] grid-cols-[repeat(3,minmax(0,7.625rem))] justify-between gap-x-1 gap-y-3 tab:max-w-[48rem] tab:grid-cols-3 tab:gap-3 pc:max-w-[80rem] pc:grid-cols-[repeat(4,18.75rem)] pc:justify-center pc:gap-5',
    gridClassName,
  )
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  return (
    <>
      <Container
        className={cn('px-0 py-5 tab:pt-6 tab:pb-10 pc:page-gutter-x pc:py-10', className)}
      >
        {header && (
          <div className="mx-auto mb-4 w-full max-w-[23.4375rem] tab:max-w-none">{header}</div>
        )}
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={posts.length === 0}
          loadingText={loadingText}
          loadingFallback={
            <GridSkeleton
              label={loadingText}
              count={6}
              className={gridClasses}
              itemClassName="rounded-none pc:rounded-lg"
            />
          }
          errorText={errorText}
          emptyText={emptyText}
          emptyAction={emptyAction}
          onRetry={onRetry}
          isRetrying={isRetrying}
        >
          {/* 모바일 3열은 375px 시안의 122px 정사각을 그대로 두고, 더 좁은 폰(360px 등)에서만 열이 줄어 가로로 넘치지 않게 한다 */}
          <div className={gridClasses}>
            {posts.map((post) => (
              <CommunityMediaCard
                key={post.postId}
                aiReview={post.aiReview}
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

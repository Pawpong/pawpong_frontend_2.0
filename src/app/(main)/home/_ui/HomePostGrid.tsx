'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import { InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { GridSkeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'
import { BREAKPOINTS } from '@/shared/lib/useBreakpoint'
import {
  CommunityMediaCard,
  CommunityProfileFeedCard,
  getFirstPhotoPostId,
} from '@/entities/community'
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
  /** 열 수·폭 상한 조정 — 컬럼이 좁아지면 고정폭 4열이 넘쳐 밖으로 삐져나간다 */
  gridClassName?: string
  /** 그리드 위 제목 줄 (마이홈 '게시글 n건' + 칩) */
  header?: ReactNode
  /**
   * grid: 정사각 사진 격자 (기본) / feed: 1열 피드 카드 — 글이 적은 입양자 홈도 비어 보이지 않게.
   * 어느 쪽이든 2단(tab+)에서 누르면 같은 상세 모달이 열린다.
   */
  layout?: 'grid' | 'feed'
}

const FEED_LIST = 'mx-auto flex w-full max-w-[40rem] flex-col gap-5'

/**
 * 모든 홈 화면에서 같은 카드 크기·상세 동작을 보장하는 게시글 목록.
 * 바깥 여백(PageShell)은 호출부가 정한다 — 마이홈은 다른 탭과 같은 여백, 공개 홈은 모바일 꽉 찬 그리드.
 */
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
  gridClassName,
  header,
  layout = 'grid',
}: HomePostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const gridClasses = cn(
    'mx-auto grid w-full max-w-[23.4375rem] grid-cols-[repeat(3,minmax(0,7.625rem))] justify-between gap-x-1 gap-y-3 tab:max-w-[48rem] tab:grid-cols-3 tab:gap-3 pc:max-w-[80rem] pc:grid-cols-[repeat(4,18.75rem)] pc:justify-center pc:gap-5',
    gridClassName,
  )
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  // 2단(tab+)에서는 목록을 떠나지 않고 상세 모달로 연다. 새 탭 열기(보조키)와 모바일은 링크 그대로
  const openInModal = (postId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
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
    setSelectedPostId(postId)
  }

  return (
    <>
      {header && <div className="mb-4">{header}</div>}
      <ListState
        isPending={isPending}
        isError={isError}
        isEmpty={posts.length === 0}
        loadingText={loadingText}
        loadingFallback={
          <GridSkeleton
            label={loadingText}
            count={layout === 'feed' ? 2 : 6}
            className={layout === 'feed' ? FEED_LIST : gridClasses}
          />
        }
        errorText={errorText}
        emptyText={emptyText}
        emptyAction={emptyAction}
        onRetry={onRetry}
        isRetrying={isRetrying}
      >
        {layout === 'feed' ? (
          <div className={FEED_LIST}>
            {posts.map((post) => (
              <CommunityProfileFeedCard
                key={post.postId}
                post={post}
                preload={post.postId === firstPhotoPostId}
                onClick={openInModal(post.postId)}
              />
            ))}
          </div>
        ) : (
          // 모바일 3열은 375px 시안의 122px 정사각을 그대로 두고, 더 좁은 폰(360px 등)에서만 열이 줄어 가로로 넘치지 않게 한다
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
                onClick={openInModal(post.postId)}
              />
            ))}
          </div>
        )}
      </ListState>
      {pagination && (
        <InfiniteScrollTrigger
          onIntersect={pagination.onLoadMore}
          hasNextPage={pagination.hasNextPage}
          isFetchingNextPage={pagination.isFetchingNextPage}
        />
      )}

      <HomePostDetailModal
        postId={selectedPostId}
        onOpenChange={(open) => !open && setSelectedPostId(null)}
      />
    </>
  )
}

export { HomePostGrid }

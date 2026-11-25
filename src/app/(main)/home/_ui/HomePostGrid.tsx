'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import { InfiniteScrollTrigger, ListState } from '@/shared/ui'
import { GridSkeleton } from '@/shared/ui/Skeleton'
import { BREAKPOINTS } from '@/shared/lib/useBreakpoint'
import { CommunityProfileFeedCard, getFirstPhotoPostId } from '@/entities/community'
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
  /** 목록 위 머리 (마이홈 칩 줄·입양자 홈 '피드 n건') */
  header?: ReactNode
}

const FEED_LIST = 'mx-auto flex w-full max-w-[40rem] flex-col gap-5'

/**
 * 모든 홈(마이홈·입양자 홈·브리더 홈 피드 탭)이 같이 쓰는 게시글 목록 — 1열 피드 카드.
 * 글이 한두 개뿐이어도 화면이 비어 보이지 않는다. 2단(tab+)에서 누르면 목록을 떠나지 않고 상세 모달이 열린다.
 * 바깥 여백(PageShell)은 호출부가 정한다.
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
  header,
}: HomePostGridProps) => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const firstPhotoPostId = getFirstPhotoPostId(posts)

  // 새 탭 열기(보조키)와 모바일은 링크 그대로 간다
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
        loadingFallback={<GridSkeleton label={loadingText} count={2} className={FEED_LIST} />}
        errorText={errorText}
        emptyText={emptyText}
        emptyAction={emptyAction}
        onRetry={onRetry}
        isRetrying={isRetrying}
      >
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

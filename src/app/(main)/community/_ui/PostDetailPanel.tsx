'use client'

import { BeforeAfterSlider } from '@/shared/ui'
import { ActivityBadgeRow } from '@/entities/gamification'
import { usePublicActivityBadges } from '@/features/gamification'

import type { ReactNode } from 'react'
import {
  AsyncState,
  DeleteConfirmModal,
  ImageCarousel,
  LoginPromptModal,
  OwnerActionsMenu,
  ProfileAvatar,
} from '@/shared/ui'
import {
  COMMUNITY_CAROUSEL_STYLE,
  COMMUNITY_LOGIN_PROMPT,
  CommunityPostActions,
} from '@/entities/community'
import { useLoginGuard } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { usePostDetail } from '../post/[postId]/_ui/usePostDetail'
import { useCommentThread } from '../post/[postId]/_ui/useCommentThread'
import { CommentList } from '../post/[postId]/_ui/CommentList'
import { CommentComposerBar } from '../post/[postId]/_ui/CommentComposerBar'

/**
 * 게시글 상세 본문 (Figma feed-detail, node 3753:246802)
 * pc는 이미지/댓글 좌우 분할(side-by-side), tab 모달과 mo 페이지는 세로 스택(stacked)으로
 * 같은 컴포넌트를 공유한다 — Figma에서 tab과 mo가 device=tab-mo 하나를 쓰는 것과 동일하다.
 */
interface PostDetailPanelProps {
  postId: string
  /** side-by-side: pc 모달 · stacked: tab 모달·mo 페이지 공용 */
  layout: 'side-by-side' | 'stacked'
  /** 헤더 오른쪽 끝 아이콘 — 모달은 닫기(X), mo 페이지는 목록으로 */
  trailingAction?: ReactNode
  className?: string
}

// [refactored] 두 레이아웃 분기에 같은 값이 있어 상수로
const COMPOSER_CLASS =
  'shrink-0 border-t border-neutral-150 bg-base-white px-4 pb-[env(safe-area-inset-bottom)]'

const PostDetailPanel = ({ postId, layout, trailingAction, className }: PostDetailPanelProps) => {
  const {
    router,
    post,
    isPending,
    isError,
    refetch,
    isOwner,
    toggleLike,
    isLikePending,
    toggleBookmark,
    isBookmarkPending,
    confirmDeletePost,
    setConfirmDeletePost,
    handleDeletePost,
    isDeletePending,
    isFetching: isRetrying,
  } = usePostDetail(postId)
  // 좋아요·북마크는 비로그인 요청이 401로 떨어지므로 먼저 로그인으로 유도한다
  const { guard, isPromptOpen, setPromptOpen } = useLoginGuard()
  // 목록과 입력창이 서로 떨어진 자리에 배치되므로 스레드 상태는 여기서 한 번만 만든다
  const thread = useCommentThread(postId)
  const badges = usePublicActivityBadges(
    post
      ? [{ ownerId: post.authorId, role: post.authorModel === 'Breeder' ? 'breeder' : 'adopter' }]
      : [],
  )

  // 캐시가 없는 직접 진입에서는 상세 응답 전까지 채울 값이 없다 — 빈 패널 대신 상태를 알린다
  if (!post) {
    return (
      <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
        <div className="flex shrink-0 items-center justify-end px-4 py-2">{trailingAction}</div>
        <AsyncState
          status={isError ? 'error' : isPending ? 'loading' : 'empty'}
          message={
            isError
              ? '게시글을 불러오지 못했습니다.'
              : isPending
                ? '게시글을 불러오는 중입니다.'
                : '삭제되었거나 볼 수 없는 게시글입니다.'
          }
          onRetry={isError ? () => void refetch() : undefined}
          isRetrying={isRetrying}
          className="min-h-0 flex-1"
        />
      </div>
    )
  }

  const hasImages = post.photoUrls.length > 0
  const isSideBySide = layout === 'side-by-side'

  const header = (
    <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
      {/* 전체 페이지 이동으로 홈에서 연 모달과 인터셉트 모달 상태도 함께 정리한다. */}
      <a
        href={`/home/${post.authorId}`}
        aria-label={`${post.authorNickname}님의 홈으로 이동`}
        className="flex min-w-0 items-center gap-2 rounded-lg focus-ring"
      >
        <ProfileAvatar
          size="medium"
          src={post.authorProfileImageUrl}
          alt={post.authorNickname}
          className="shrink-0"
        />
        <span className="min-w-0">
          <span className="block truncate text-body-lg font-semibold text-neutral-850">
            {post.authorNickname}
          </span>
          <ActivityBadgeRow
            badges={
              badges.find(
                (owner) =>
                  owner.ownerId === post.authorId &&
                  owner.role === (post.authorModel === 'Breeder' ? 'breeder' : 'adopter'),
              )?.badges ?? []
            }
          />
        </span>
      </a>
      {trailingAction}
    </div>
  )

  const caption = (
    <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
      <p className="min-w-0 flex-1 text-body-md leading-relaxed font-medium whitespace-pre-wrap text-neutral-850">
        {post.body}
      </p>
      {isOwner && (
        <OwnerActionsMenu
          onEdit={() => router.push(`/community/post/${postId}/edit`)}
          onDelete={() => setConfirmDeletePost(true)}
        />
      )}
    </div>
  )

  // 인스타그램처럼 액션바는 본문 흐름 안에 두고, 하단에는 입력창만 고정한다
  const actionBar = (
    <div className="border-b border-neutral-100 px-4 py-3">
      <CommunityPostActions
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        liked={post.isLiked}
        saved={post.isSaved}
        share={
          post.visibility === 'public' && post.status === 'published'
            ? {
                url: `/community/post/${postId}`,
                title: post.title || `${post.authorNickname}님의 게시글`,
                description: post.body,
                imageUrl: post.photoUrls[0],
              }
            : undefined
        }
        onToggleLike={isLikePending ? undefined : guard(toggleLike)}
        onToggleSave={isBookmarkPending ? undefined : guard(toggleBookmark)}
      />
    </div>
  )

  const modals = (
    <>
      <DeleteConfirmModal
        open={confirmDeletePost}
        onOpenChange={setConfirmDeletePost}
        target="게시글"
        onConfirm={handleDeletePost}
        isPending={isDeletePending}
      />
      <LoginPromptModal
        open={isPromptOpen}
        onOpenChange={setPromptOpen}
        description={COMMUNITY_LOGIN_PROMPT.reaction} // [refactored]
      />
    </>
  )

  // 브랜드 옐로우 점·불투명 진회색 화살표 — 피드 카드와 동일한 톤
  const comparison = post.aiComparison
  const extraImages = comparison
    ? post.photoUrls.filter(
        (_, index) => index !== comparison.beforePhotoIndex && index !== comparison.afterPhotoIndex,
      )
    : []
  const imageCarousel =
    hasImages &&
    (comparison &&
    post.photoUrls[comparison.beforePhotoIndex] &&
    post.photoUrls[comparison.afterPhotoIndex] ? (
      <div className={isSideBySide ? 'h-full w-[60%] shrink-0 overflow-y-auto' : 'w-full shrink-0'}>
        <BeforeAfterSlider
          beforeSrc={post.photoUrls[comparison.beforePhotoIndex]}
          afterSrc={post.photoUrls[comparison.afterPhotoIndex]}
          className="rounded-none"
        />
        {extraImages.length > 0 && (
          <ImageCarousel
            images={extraImages}
            alt={post.authorNickname}
            bgClassName="bg-white"
            imageClassName="object-contain"
            className="aspect-square w-full"
            {...COMMUNITY_CAROUSEL_STYLE}
          />
        )}
      </div>
    ) : (
      <ImageCarousel
        images={post.photoUrls}
        alt={post.authorNickname}
        preloadFirstImage
        bgClassName="bg-white"
        imageClassName="object-contain"
        className={isSideBySide ? 'h-full w-[60%] shrink-0' : 'aspect-square w-full shrink-0'}
        {...COMMUNITY_CAROUSEL_STYLE}
      />
    ))

  if (isSideBySide) {
    return (
      <div className={cn('flex h-full min-h-0 w-full flex-row', className)}>
        {imageCarousel}
        <div
          className={cn(
            'flex min-h-0 flex-col',
            hasImages ? 'w-[40%] border-l border-neutral-100' : 'flex-1',
          )}
        >
          {header}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {caption}
            {actionBar}
            <div className="p-4">
              <CommentList thread={thread} />
            </div>
          </div>
          <CommentComposerBar thread={thread} className={COMPOSER_CLASS} />
        </div>
        {modals}
      </div>
    )
  }

  // stacked — 헤더·액션바만 고정하고 이미지~댓글을 하나의 스크롤 영역으로 묶는다
  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {imageCarousel}
        {caption}
        {actionBar}
        <div className="p-4">
          <CommentList thread={thread} />
        </div>
      </div>
      <CommentComposerBar thread={thread} className={COMPOSER_CLASS} />
      {modals}
    </div>
  )
}

export { PostDetailPanel }

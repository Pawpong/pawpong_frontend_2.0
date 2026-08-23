'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { DeleteConfirmModal } from '@/shared/ui'
import { FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { usePostDetail } from '../[postId]/_ui/usePostDetail'
import { CommentSection } from '../[postId]/_ui/CommentSection'
import { PostImageCarousel } from './PostImageCarousel'
import { CommunityAvatar } from './CommunityAvatar'
import { PostDetailMoreMenu } from './PostDetailMoreMenu'

/**
 * 최은진: 신규 파일 — Figma "feed-detail" 컴포넌트(node 3753:246802, device=pc·device=tab-mo)를
 * 그대로 반영한 상세 콘텐츠.
 * https://www.figma.com/design/7VXGIjqr1eZBEmsp3OPNie/2026-pawpong?node-id=3753-246802
 *
 * pc(side-by-side)·tab(stacked, 모달)·mo(stacked, 실제 페이지) 세 곳이 전부 이
 * 하나의 컴포넌트를 쓴다 — Figma에서 tab과 mo가 "device=tab-mo" 하나의 베리언트를
 * 공유하는 것과 동일하게, 코드에서도 stacked 레이아웃을 하나로 합쳤다. tab/pc는
 * 모달 안(트레일링에 닫기 X)에서, mo는 페이지로(트레일링에 뒤로가기) 이 컴포넌트를 쓴다.
 *
 * 최은진: Figma 헤더의 "팔로우"는 게시글 작성자를 팔로우하는 API가 이 프로젝트에
 * 아직 없어(FollowButton은 마이홈 프로필 전용) 정적 텍스트로만 UI를 반영했다 —
 * 클릭해도 동작하지 않는 버튼을 만드는 대신, 실제 팔로우 기능은 별도 작업으로 남겨둔다.
 *
 * 최은진: 아바타·좋아요/댓글/북마크 액션 행·더보기 메뉴를 shared/ui(Avatar/PostActionButton/
 * OwnerActionsMenu) 대신 CommunityFeedCard.tsx/CommunityAvatar.tsx와 똑같은 원칙으로
 * 로컬 마크업(CommunityAvatar, PostDetailMoreMenu, 인라인 버튼)으로 바꿨다 — shared/ui가
 * 다른 화면 사정으로 바뀌어도 이 피드 상세는 영향받지 않고, Figma에 맞춰 이 화면을 고쳐도
 * 다른 화면에 번지지 않는다. 아이콘 SVG(FavoriteIcon 등)는 순수 자산이라 그대로 재사용한다.
 * DeleteConfirmModal은 Figma에 없는 앱 전역 삭제 확인 다이얼로그라 계속 공유한다.
 */
interface PostDetailPanelProps {
  postId: string
  /** side-by-side: pc 모달(device=pc) · stacked: tab 모달·mo 페이지 공용(device=tab-mo) */
  layout: 'side-by-side' | 'stacked'
  /** 헤더 오른쪽 끝 아이콘 — 모달은 닫기(X), mo 페이지는 뒤로가기 */
  trailingAction: ReactNode
  className?: string
}

// 최은진: CommunityFeedCard.tsx의 아이콘 press 상태 색과 동일 — shared/ui(PostActionButton의
// BOOKMARK_ACTIVE 등)를 거치지 않고 이 화면 안에서 직접 관리한다.
const LIKE_ACTIVE = 'text-[#ff8181]'
const BOOKMARK_ACTIVE = 'text-[#a9835a]'
const ICON_DEFAULT = 'text-neutral-500'

const PostDetailPanel = ({ postId, layout, trailingAction, className }: PostDetailPanelProps) => {
  const {
    router,
    post,
    isOwner,
    toggleLike,
    isLikePending,
    toggleBookmark,
    isBookmarkPending,
    confirmDeletePost,
    setConfirmDeletePost,
    handleDeletePost,
    isDeletePending,
  } = usePostDetail(postId)

  if (!post) return null

  const hasImages = post.photoUrls.length > 0
  const isSideBySide = layout === 'side-by-side'

  const header = (
    <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
      <div className="flex items-center gap-2">
        <Link href={`/home/${post.authorId}`} className="flex items-center gap-2">
          <CommunityAvatar src={post.authorProfileImageUrl} alt={post.authorNickname} />
          <span className="text-base font-semibold text-text-primary">{post.authorNickname}</span>
        </Link>
        <span className="text-sm font-semibold text-primary-500">팔로우</span>
      </div>
      {trailingAction}
    </div>
  )

  // 최은진: Figma 캡션은 truncate가 아니라 자연스러운 여러 줄 줄바꿈이다 — get_design_context가
  // 돌려준 코드 힌트(text-ellipsis whitespace-nowrap)만 믿고 한 줄 truncate로 잘못 옮겼던 걸,
  // 실제 Figma 스크린샷(pc·tab-mo 둘 다 캡션이 3줄까지 그대로 보임)을 다시 확인하고 고쳤다.
  const caption = (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light px-4 py-3">
      <p className="min-w-0 flex-1 text-sm font-semibold whitespace-pre-wrap text-neutral-850">
        {post.body}
      </p>
      {isOwner && (
        <PostDetailMoreMenu
          onEdit={() => router.push(`/community/${postId}/edit`)}
          onDelete={() => setConfirmDeletePost(true)}
        />
      )}
    </div>
  )

  const commentsScroll = (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <CommentSection postId={postId} />
    </div>
  )

  // 최은진: shared/ui의 PostActionButton 대신 CommunityFeedCard.tsx와 동일한 인라인 버튼으로.
  const actionBar = (
    <div className="flex shrink-0 items-center gap-2 border-t border-border-light p-4">
      <button
        type="button"
        aria-label="좋아요"
        onClick={toggleLike}
        disabled={isLikePending}
        className={cn(
          'flex items-center gap-1 disabled:opacity-50',
          post.isLiked ? LIKE_ACTIVE : ICON_DEFAULT,
        )}
      >
        <FavoriteIcon status={post.isLiked ? 'fill' : 'default'} className="size-8" />
        <span className="text-sm font-semibold text-neutral-850">{post.likeCount}</span>
      </button>

      <div className={cn('flex items-center gap-1', ICON_DEFAULT)}>
        <PixelMessageIcon className="size-8" />
        <span className="text-sm font-semibold text-neutral-850">{post.commentCount}</span>
      </div>

      <button
        type="button"
        aria-label="북마크"
        onClick={toggleBookmark}
        disabled={isBookmarkPending}
        className={cn('disabled:opacity-50', post.isSaved ? BOOKMARK_ACTIVE : ICON_DEFAULT)}
      >
        <PixelBookmarkIcon className="size-8" />
      </button>
    </div>
  )

  const deleteConfirm = (
    <DeleteConfirmModal
      open={confirmDeletePost}
      onOpenChange={setConfirmDeletePost}
      target="게시글"
      onConfirm={handleDeletePost}
      isPending={isDeletePending}
    />
  )

  // 최은진: CommunityFeedCard.tsx와 동일한 값으로 override — 기본값(흰 점·반투명 검정 화살표)이
  // 아니라 Figma 브랜드 옐로우 점(point-500 #fffe72)·불투명 진회색 화살표(neutral-850 #3e3e3e)로
  // 맞췄다. 이전엔 override를 안 넘겨서 컴포넌트 기본값이 그대로 새어나왔었다.
  const imageCarousel = hasImages && (
    <PostImageCarousel
      images={post.photoUrls}
      alt={post.authorNickname}
      className={isSideBySide ? 'h-full w-[60%] shrink-0' : 'aspect-square w-full shrink-0'}
      buttonClassName="size-8 bg-neutral-850/90 hover:bg-neutral-850"
      activeDotClassName="h-2 w-5 rounded-full bg-point-500"
      inactiveDotClassName="size-2 rounded-full bg-point-500/20"
    />
  )

  if (isSideBySide) {
    return (
      <div className={cn('flex h-full min-h-0 w-full flex-row', className)}>
        {imageCarousel}
        <div className={cn('flex min-h-0 flex-col', hasImages ? 'w-[40%]' : 'flex-1')}>
          {header}
          {caption}
          {commentsScroll}
          {actionBar}
        </div>
        {deleteConfirm}
      </div>
    )
  }

  // 최은진: tab/mo(stacked)는 최상단 헤더·최하단 액션바만 고정하고, 이미지~댓글까지는
  // 하나의 스크롤 영역으로 묶는다(기존엔 댓글 영역만 따로 스크롤됐음) — pc(side-by-side)는
  // 위 분기에서 그대로 두고 건드리지 않았다.
  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col', className)}>
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {imageCarousel}
        {caption}
        <div className="p-4">
          <CommentSection postId={postId} />
        </div>
      </div>
      {actionBar}
      {deleteConfirm}
    </div>
  )
}

export { PostDetailPanel }

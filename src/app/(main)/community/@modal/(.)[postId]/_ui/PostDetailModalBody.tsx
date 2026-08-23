'use client'

import {
  AuthorInfo,
  BOOKMARK_ACTIVE,
  DeleteConfirmModal,
  OwnerActionsMenu,
  PostActionButton,
  Separator,
} from '@/shared/ui'
import { FavoriteIcon, PixelMessageIcon, PixelBookmarkIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { usePostDetail } from '../../../[postId]/_ui/usePostDetail'
import { CommentSection } from '../../../[postId]/_ui/CommentSection'
import { PostImageCarousel } from '../../../_ui/PostImageCarousel'

interface PostDetailModalBodyProps {
  postId: string
}

/**
 * 인스타그램 웹 데스크톱 상세 모달 레이아웃 — 사진을 왼쪽에 꽉 채우고, 오른쪽에
 * 헤더·본문·댓글·액션을 배치한다. tab 미만(모바일)에서는 사진이 위, 나머지가 아래로 쌓인다.
 * 풀페이지 상세(PostDetailContent)와 데이터·액션 로직은 usePostDetail로 공유하고 배치만 다르다.
 */
const PostDetailModalBody = ({ postId }: PostDetailModalBodyProps) => {
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

  return (
    <div className="flex h-full min-h-0 w-full flex-col tab:flex-row">
      {hasImages && (
        <PostImageCarousel
          images={post.photoUrls}
          alt={post.authorNickname}
          className="aspect-square w-full shrink-0 tab:aspect-auto tab:h-full tab:w-[60%]"
        />
      )}

      <div className={cn('flex min-h-0 flex-1 flex-col', hasImages && 'tab:w-[40%]')}>
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-2 border-b border-border-light p-4">
          <AuthorInfo
            size="md"
            authorId={post.authorId}
            nickname={post.authorNickname}
            profileImageUrl={post.authorProfileImageUrl}
            createdAt={post.createdAt}
          />
          {isOwner && (
            <OwnerActionsMenu
              onEdit={() => router.push(`/community/${postId}/edit`)}
              onDelete={() => setConfirmDeletePost(true)}
            />
          )}
        </div>

        {/* 본문 + 댓글 (이 영역만 스크롤) */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="p-4 text-sm leading-[1.6] font-semibold whitespace-pre-wrap text-neutral-850">
            {post.body}
          </p>
          <Separator className="bg-border-light" />
          <div className="p-4">
            <CommentSection postId={postId} />
          </div>
        </div>

        {/* 액션 — 하단 고정 */}
        <div className="flex items-center gap-2 border-t border-border-light p-4">
          <PostActionButton
            icon={FavoriteIcon}
            count={post.likeCount}
            iconClassName="size-8"
            ariaLabel="좋아요"
            active={post.isLiked}
            iconStatus={post.isLiked ? 'fill' : 'default'}
            onClick={toggleLike}
            disabled={isLikePending}
          />
          <PostActionButton
            icon={PixelMessageIcon}
            count={post.commentCount}
            iconClassName="size-8"
          />
          <PostActionButton
            icon={PixelBookmarkIcon}
            iconClassName="size-8"
            ariaLabel="북마크"
            active={post.isSaved}
            activeClassName={BOOKMARK_ACTIVE}
            onClick={toggleBookmark}
            disabled={isBookmarkPending}
          />
        </div>
      </div>

      <DeleteConfirmModal
        open={confirmDeletePost}
        onOpenChange={setConfirmDeletePost}
        target="게시글"
        onConfirm={handleDeletePost}
        isPending={isDeletePending}
      />
    </div>
  )
}

export { PostDetailModalBody }

'use client'

import { FavoriteIcon, PixelBookmarkIcon, PixelMessageIcon } from '@/shared/assets'
import { BOOKMARK_ACTIVE, PostActionButton } from '@/shared/ui'

interface CommunityPostActionsProps {
  likeCount: number
  commentCount: number
  liked: boolean
  saved: boolean
  /** 미전달 시 버튼은 표시만 되고 동작하지 않는다 (features 래퍼에서 주입) */
  onToggleLike?: () => void
  onToggleSave?: () => void
  /** 있으면 댓글 아이콘이 게시글 상세 링크가 된다 */
  detailHref?: string
}

const CommunityPostActions = ({
  likeCount,
  commentCount,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
  detailHref,
}: CommunityPostActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <PostActionButton
        icon={FavoriteIcon}
        count={likeCount}
        iconClassName="size-8"
        ariaLabel="좋아요"
        active={liked}
        iconStatus={liked ? 'fill' : 'default'}
        onClick={onToggleLike}
      />
      <PostActionButton
        icon={PixelMessageIcon}
        count={commentCount}
        iconClassName="size-8"
        ariaLabel="댓글 보기"
        href={detailHref}
      />
      <PostActionButton
        icon={PixelBookmarkIcon}
        iconClassName="size-8"
        ariaLabel="북마크"
        active={saved}
        activeClassName={BOOKMARK_ACTIVE}
        onClick={onToggleSave}
      />
    </div>
  )
}

export { CommunityPostActions }

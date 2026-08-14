'use client'

import { FavoriteIcon, PixelBookmarkIcon, PixelMessageIcon } from '@/shared/assets/icons'
import { BOOKMARK_ACTIVE, PostActionButton } from '@/shared/ui'

interface CommunityPostActionsProps {
  likeCount: number
  commentCount: number
  liked: boolean
  saved: boolean
  /** 미전달 시 버튼은 표시만 되고 동작하지 않는다 (features 래퍼에서 주입) */
  onToggleLike?: () => void
  onToggleSave?: () => void
}

const CommunityPostActions = ({
  likeCount,
  commentCount,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
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
      <PostActionButton icon={PixelMessageIcon} count={commentCount} iconClassName="size-8" />
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

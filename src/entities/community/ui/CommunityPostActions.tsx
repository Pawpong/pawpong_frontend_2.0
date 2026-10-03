'use client'

import { FavoriteIcon, PixelBookmarkIcon, PixelMessageIcon } from '@/shared/assets'
import { ToggleIconButton, ShareButton, type ShareButtonProps } from '@/shared/ui'

interface CommunityPostActionsProps {
  likeCount: number
  commentCount: number
  liked: boolean
  saved: boolean
  /** 미전달 시 버튼은 표시만 되고 동작하지 않는다 (features 래퍼에서 주입) */
  onToggleLike?: () => void
  onToggleSave?: () => void
  /** 있으면 공유 버튼을 보여준다 — 공개·게시 상태인 글에만 넘긴다 */
  share?: ShareButtonProps
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
  share,
}: CommunityPostActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <ToggleIconButton
        icon={FavoriteIcon}
        hasFillState
        size="md"
        count={likeCount}
        aria-label="좋아요"
        pressed={liked}
        onClick={onToggleLike}
      />
      <ToggleIconButton
        icon={PixelMessageIcon}
        size="md"
        count={commentCount}
        aria-label="댓글 보기"
        href={detailHref}
      />
      <ToggleIconButton
        icon={PixelBookmarkIcon}
        size="md"
        aria-label="북마크"
        pressed={saved}
        pressedTone="bookmark"
        onClick={onToggleSave}
      />
      {share && <ShareButton {...share} ariaLabel="게시글 공유하기" />}
    </div>
  )
}

export { CommunityPostActions }

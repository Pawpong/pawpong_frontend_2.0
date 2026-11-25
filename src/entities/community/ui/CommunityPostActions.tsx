'use client'

import { FavoriteIcon, MessageIcon } from '@/shared/assets'
import { ToggleIconButton } from '@/shared/ui'

interface CommunityPostActionsProps {
  likeCount: number
  commentCount: number
  liked: boolean
  /** 미전달 시 버튼은 표시만 되고 동작하지 않는다 (features 래퍼에서 주입) */
  onToggleLike?: () => void
  /** 있으면 댓글 아이콘이 게시글 상세 링크가 된다 */
  detailHref?: string
}

/** 좋아요·댓글 — 저장·공유는 PostMoreMenu(⋮)에 있다. */
const CommunityPostActions = ({
  likeCount,
  commentCount,
  liked,
  onToggleLike,
  detailHref,
}: CommunityPostActionsProps) => {
  return (
    <div className="flex items-center gap-3">
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
        icon={MessageIcon}
        size="md"
        count={commentCount}
        aria-label="댓글 보기"
        href={detailHref}
      />
    </div>
  )
}

export { CommunityPostActions }

'use client'

import { useState } from 'react'
import { FavoriteIcon, PixelBookmarkIcon, PixelMessageIcon } from '@/shared/assets/icons'
import { BOOKMARK_ACTIVE, PostActionButton } from '@/shared/ui'

interface CommunityPostActionsProps {
  likeCount: number
  commentCount: number
}

const CommunityPostActions = ({ likeCount, commentCount }: CommunityPostActionsProps) => {
  // ponytail: API 미연결 — mutation 연결 전까지 공통 로컬 상태로 색과 카운트만 반영한다.
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <PostActionButton
        icon={FavoriteIcon}
        count={likeCount + (liked ? 1 : 0)}
        iconClassName="size-8"
        ariaLabel="좋아요"
        active={liked}
        iconStatus={liked ? 'fill' : 'default'}
        onClick={() => setLiked((current) => !current)}
      />
      <PostActionButton icon={PixelMessageIcon} count={commentCount} iconClassName="size-8" />
      <PostActionButton
        icon={PixelBookmarkIcon}
        iconClassName="size-8"
        ariaLabel="북마크"
        active={bookmarked}
        activeClassName={BOOKMARK_ACTIVE}
        onClick={() => setBookmarked((current) => !current)}
      />
    </div>
  )
}

export { CommunityPostActions }

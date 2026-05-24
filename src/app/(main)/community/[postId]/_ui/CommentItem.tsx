'use client'

import { AuthorInfo } from '@/shared/ui'
import { FavoriteIcon } from '@/shared/assets/icons'
import type { CommunityComment } from '@/shared/types'

interface CommentItemProps {
  comment: CommunityComment
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex items-start gap-3 py-4">
      <AuthorInfo
        authorId={comment.authorId}
        nickname={comment.authorNickname}
        profileImageUrl={comment.authorProfileImageUrl}
        createdAt={comment.createdAt}
        contentSlot={
          <>
            <p className="mt-1 text-sm font-bold text-text-secondary">
              {comment.body}
            </p>
            <button
              type="button"
              className="mt-1 text-sm font-semibold text-text-secondary"
            >
              답글달기
            </button>
          </>
        }
      />

      {/* Like */}
      <button type="button" className="shrink-0 pt-1">
        <FavoriteIcon className="size-6 text-text-secondary" />
      </button>
    </div>
  )
}

export { CommentItem }

'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'
import { FavoriteIcon } from '@/shared/assets/icons'
import type { CommunityComment } from '@/shared/types'

interface CommentItemProps {
  comment: CommunityComment
}

const CommentItem = ({ comment }: CommentItemProps) => {
  return (
    <div className="flex items-start gap-3 py-4">
      {/* Avatar */}
      <Link href={`/home/${comment.authorId}`} className="shrink-0">
        <Avatar size="sm">
          {comment.authorProfileImageUrl ? (
            <AvatarImage src={comment.authorProfileImageUrl} alt={comment.authorNickname} />
          ) : (
            <AvatarFallback className="bg-fill-muted" />
          )}
        </Avatar>
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-text-primary">
            {comment.authorNickname}
          </span>
          <span className="text-xs font-bold text-text-secondary">
            {comment.createdAt}
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-text-secondary">
          {comment.body}
        </p>
        <button
          type="button"
          className="mt-1 text-sm font-semibold text-text-secondary"
        >
          답글달기
        </button>
      </div>

      {/* Like */}
      <button type="button" className="shrink-0 pt-1">
        <FavoriteIcon className="size-6 text-text-secondary" />
      </button>
    </div>
  )
}

export { CommentItem }

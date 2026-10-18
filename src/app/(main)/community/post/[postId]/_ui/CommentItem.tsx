'use client'

import { BreederLevelBadge, type BreederLevel } from '@/entities/gamification'
import { AuthorInfo, Button, OwnerActionsMenu } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import type { CommentActionsController } from './useCommentActions'
import { CommentEditForm } from './CommentEditForm'
import { commentActionTriggerId } from './commentAction'

interface CommentItemProps {
  level?: BreederLevel | null
  comment: CommunityComment
  actions: CommentActionsController
  onReply?: (comment: CommunityComment) => void
  replyDisabled?: boolean
  isReply?: boolean
}

const CommentItem = ({
  comment,
  level,
  actions,
  onReply,
  isReply,
  replyDisabled,
}: CommentItemProps) => {
  const isEditing =
    actions.active?.mode === 'edit' && actions.active.comment.commentId === comment.commentId
  return (
    <div className={`flex items-start gap-2 py-3 ${isReply ? 'pl-12' : ''}`}>
      <AuthorInfo
        size="sm"
        badgeSlot={<BreederLevelBadge level={level} />}
        className="flex min-w-0 flex-1 items-start gap-2"
        authorId={comment.authorId}
        nickname={comment.authorNickname}
        profileImageUrl={comment.authorProfileImageUrl}
        createdAt={comment.createdAt}
        contentSlot={
          <>
            {isEditing ? (
              <CommentEditForm actions={actions} currentBody={comment.body} />
            ) : (
              <p className="mt-1.5 text-body-lg font-normal break-words whitespace-pre-wrap text-neutral-850">
                {comment.body}
              </p>
            )}
            {!isEditing && onReply && (
              <Button
                intent="ghost"
                size="inline"
                disabled={replyDisabled}
                onClick={() => onReply(comment)}
              >
                답글 달기
              </Button>
            )}
          </>
        }
      />
      {actions.canManage(comment) && !isEditing && (
        <OwnerActionsMenu
          ariaLabel="댓글 더보기"
          triggerId={commentActionTriggerId(comment.commentId)}
          disabled={Boolean(actions.active) || actions.isBusy}
          onEdit={() => actions.start(comment, 'edit')}
          onDelete={() => actions.start(comment, 'delete')}
        />
      )}
    </div>
  )
}

export { CommentItem }

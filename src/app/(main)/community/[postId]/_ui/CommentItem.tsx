'use client'

import { useState } from 'react'
import { AuthorInfo, CtaModal } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { useUpdateCommunityComment, useDeleteCommunityComment } from '@/features/community'
import { OwnerActionsMenu } from '../../_ui/OwnerActionsMenu'

interface CommentItemProps {
  comment: CommunityComment
  /** 현재 로그인 사용자 ID — 본인 댓글이면 수정/삭제 메뉴 노출 */
  currentUserId?: string
  /** 답글 달기 클릭 시 대상 댓글 전달 */
  onReply?: (comment: CommunityComment) => void
  /** 답글(대댓글)이면 들여쓰기 */
  isReply?: boolean
}

const CommentItem = ({ comment, currentUserId, onReply, isReply }: CommentItemProps) => {
  const isOwner = !!currentUserId && currentUserId === comment.authorId

  const updateComment = useUpdateCommunityComment(comment.commentId)
  const deleteComment = useDeleteCommunityComment()

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.body)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim()
    if (!trimmed || updateComment.isPending) return
    await updateComment.mutateAsync({ body: trimmed })
    setIsEditing(false)
  }

  return (
    <div className={`flex items-start gap-2 py-3 ${isReply ? 'pl-12' : ''}`}>
      <AuthorInfo
        size="md"
        authorId={comment.authorId}
        nickname={comment.authorNickname}
        profileImageUrl={comment.authorProfileImageUrl}
        createdAt={comment.createdAt}
        contentSlot={
          <>
            {isEditing ? (
              <div className="mt-1 flex flex-col gap-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={1000}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[#d3d3d3] px-3 py-2 text-sm outline-none focus:border-text-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updateComment.isPending}
                    className="rounded-full bg-fill-muted px-3 py-1 text-sm font-semibold text-text-primary disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setEditValue(comment.body)
                    }}
                    className="rounded-full border border-[#cacaca] px-3 py-1 text-sm font-semibold text-text-secondary"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm font-bold text-text-secondary">{comment.body}</p>
            )}
            {!isEditing && onReply && (
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="mt-1 text-sm font-semibold text-text-secondary"
              >
                답글달기
              </button>
            )}
          </>
        }
      />

      {/* 본인 댓글: 수정/삭제 메뉴 */}
      {isOwner && !isEditing && (
        <OwnerActionsMenu
          className="shrink-0 pt-1"
          onEdit={() => setIsEditing(true)}
          onDelete={() => setConfirmDelete(true)}
        />
      )}

      <CtaModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="댓글을 삭제할까요?"
        description="삭제한 댓글은 복구할 수 없습니다."
        actions={[
          { label: '취소', variant: 'outline', onClick: () => setConfirmDelete(false) },
          {
            label: '삭제',
            variant: 'fill',
            onClick: () => {
              void deleteComment
                .mutateAsync(comment.commentId)
                .finally(() => setConfirmDelete(false))
            },
          },
        ]}
      />
    </div>
  )
}

export { CommentItem }

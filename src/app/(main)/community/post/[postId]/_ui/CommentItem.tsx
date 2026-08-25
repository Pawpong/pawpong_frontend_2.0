'use client'

import { useState } from 'react'
import { AuthorInfo, Button, DeleteConfirmModal, OwnerActionsMenu } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { useDeleteCommunityComment, useUpdateCommunityComment } from '@/features/community'

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

  const updateComment = useUpdateCommunityComment(comment.commentId, comment.postId)
  const deleteComment = useDeleteCommunityComment(comment.postId)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.body)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSaveEdit = () => {
    const trimmed = editValue.trim()
    if (!trimmed || updateComment.isPending) return
    updateComment.mutate({ body: trimmed }, { onSuccess: () => setIsEditing(false) })
  }

  return (
    <div className={`flex items-start gap-2 py-3 ${isReply ? 'pl-12' : ''}`}>
      <AuthorInfo
        size="md"
        // 남는 가로를 댓글이 차지해야 ⋯ 메뉴가 오른쪽 끝으로 밀린다
        className="flex min-w-0 flex-1 items-start gap-2"
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
                  onChange={(event) => setEditValue(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-text-primary"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editValue.trim() || updateComment.isPending}
                    className="px-3"
                  >
                    {updateComment.isPending ? '저장 중' : '저장'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditValue(comment.body)
                      updateComment.reset()
                    }}
                    disabled={updateComment.isPending}
                    className="px-3 text-text-secondary"
                  >
                    취소
                  </Button>
                </div>
                {updateComment.isError && (
                  <p role="alert" className="text-xs text-error-700">
                    댓글 수정에 실패했습니다. 다시 시도해주세요.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-1 text-sm font-bold break-words whitespace-pre-wrap text-text-secondary">
                {comment.body}
              </p>
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

      {/* 본인 댓글에서만 ⋮ → 수정/삭제 메뉴 노출 */}
      {isOwner && !isEditing && (
        <OwnerActionsMenu
          className="shrink-0 pt-1"
          onEdit={() => {
            setEditValue(comment.body)
            updateComment.reset()
            setIsEditing(true)
          }}
          onDelete={() => setConfirmDelete(true)}
        />
      )}

      {isOwner && (
        <DeleteConfirmModal
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          target="댓글"
          // 삭제 성공 후에만 닫고, 갱신된 댓글 목록과 댓글 수는 mutation 훅이 다시 조회한다.
          onConfirm={() =>
            deleteComment.mutate(comment.commentId, { onSuccess: () => setConfirmDelete(false) })
          }
          isPending={deleteComment.isPending}
        />
      )}
    </div>
  )
}

export { CommentItem }

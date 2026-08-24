'use client'

import { useState } from 'react'
import { AuthorInfo, DeleteConfirmModal, OwnerActionsMenu } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { useUpdateCommunityComment, useDeleteCommunityComment } from '@/features/community'

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

  // 삭제와 같은 방식 — 성공했을 때만 편집 모드를 닫는다 (실패하면 입력 유지, unhandled rejection 없음)
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
                    className="rounded-full border border-neutral-300 px-3 py-1 text-sm font-semibold text-text-secondary"
                  >
                    취소
                  </button>
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

      {/* 본인 댓글: 수정/삭제 메뉴 */}
      {isOwner && !isEditing && (
        <OwnerActionsMenu
          className="shrink-0 pt-1"
          onEdit={() => setIsEditing(true)}
          onDelete={() => setConfirmDelete(true)}
        />
      )}

      {/* [refactored] 댓글 삭제 확인 — 공통 DeleteConfirmModal */}
      <DeleteConfirmModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        target="댓글"
        // 삭제 성공 후에만 닫는다 (실패하면 모달을 유지해 재시도 가능)
        onConfirm={() =>
          deleteComment.mutate(comment.commentId, { onSuccess: () => setConfirmDelete(false) })
        }
        isPending={deleteComment.isPending}
      />
    </div>
  )
}

export { CommentItem }

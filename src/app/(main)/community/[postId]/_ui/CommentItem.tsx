'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DeleteConfirmModal } from '@/shared/ui'
import type { CommunityComment } from '@/shared/types'
import { useUpdateCommunityComment, useDeleteCommunityComment } from '@/features/community'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import { CommunityAvatar } from '../../_ui/CommunityAvatar'
import { PostDetailMoreMenu } from '../../_ui/PostDetailMoreMenu'

interface CommentItemProps {
  comment: CommunityComment
  /** 현재 로그인 사용자 ID — 본인 댓글이면 수정/삭제 메뉴 노출 */
  currentUserId?: string
  /** 답글 달기 클릭 시 대상 댓글 전달 */
  onReply?: (comment: CommunityComment) => void
  /** 답글(대댓글)이면 들여쓰기 */
  isReply?: boolean
}

/**
 * 최은진: 아바타·닉네임·더보기 메뉴를 shared/ui(AuthorInfo/OwnerActionsMenu) 대신
 * CommunityFeedCard.tsx와 같은 원칙으로 로컬 마크업(CommunityAvatar, PostDetailMoreMenu)으로
 * 바꿨다 — Figma feed-detail의 "chat-profile" 노드 구조(아바타+닉네임+방금전, 그 아래 본문)를
 * 그대로 따르고, shared/ui가 다른 화면 사정으로 바뀌어도 댓글은 영향받지 않게 했다.
 * 편집모드(textarea/저장/취소) 로직은 그대로 두고 마크업만 옮겼다.
 */
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
      <Link href={`/home/${comment.authorId}`} className="shrink-0">
        <CommunityAvatar src={comment.authorProfileImageUrl} alt={comment.authorNickname} />
      </Link>
      {/* 남는 가로를 댓글이 차지해야 ⋯ 메뉴가 오른쪽 끝으로 밀린다 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/home/${comment.authorId}`}
            className="text-base font-semibold text-text-primary"
          >
            {comment.authorNickname}
          </Link>
          <span className="text-xs font-medium text-text-secondary" suppressHydrationWarning>
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1 flex flex-col gap-2">
            {/* 최은진: 테두리 하드코딩 색상(#d3d3d3) → border-neutral-500 토큰으로 교체,
                텍스트 색상(text-neutral-850)·포커스 시 border-info-500 트랜지션 추가 */}
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full resize-none rounded-lg border border-neutral-500 px-3 py-2 text-sm text-neutral-850 outline-none transition-colors focus:border-info-500"
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
          // 최은진: 댓글 본문 스타일 font-bold/text-text-secondary → font-semibold/text-neutral-850로 교체
          <p className="mt-1 text-sm font-semibold break-words whitespace-pre-wrap text-neutral-850">
            {comment.body}
          </p>
        )}
        {!isEditing && onReply && (
          // 최은진: 답글달기 버튼 font-semibold/text-text-secondary → font-medium/text-neutral-700로
          // 교체하고 hover:text-neutral-850 트랜지션 추가
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-1 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-850"
          >
            답글달기
          </button>
        )}
      </div>

      {/* 본인 댓글: 수정/삭제 메뉴 */}
      {isOwner && !isEditing && (
        <PostDetailMoreMenu
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

'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui'

interface CommentComposerProps {
  onSubmit: (body: string) => void | Promise<void>
  isSubmitting?: boolean
  /** 작성자(나) 아바타 */
  profileImageUrl?: string
  /** 답글 대상 닉네임 — 있으면 답글 모드 배너 표시 */
  replyingToNickname?: string | null
  onCancelReply?: () => void
}

/**
 * 댓글/답글 입력창 (Figma 2612:269261 comment-input) — 아바타 + 박스(placeholder "댓글달기" + "게시").
 * 답글 모드에서는 대상 닉네임 배너 + 취소를 노출한다. 제출 성공 후 입력값을 비운다.
 */
const CommentComposer = ({
  onSubmit,
  isSubmitting = false,
  profileImageUrl,
  replyingToNickname,
  onCancelReply,
}: CommentComposerProps) => {
  const [value, setValue] = useState('')
  const trimmed = value.trim()

  const handleSubmit = async () => {
    if (!trimmed || isSubmitting) return
    await onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className="flex flex-col gap-2 py-3">
      {replyingToNickname && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span className="font-semibold">@{replyingToNickname}에게 답글</span>
          <button type="button" onClick={onCancelReply} className="text-text-secondary underline">
            취소
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Avatar size="md" className="shrink-0">
          {profileImageUrl ? (
            <AvatarImage src={profileImageUrl} alt="내 프로필" />
          ) : (
            <AvatarFallback className="bg-fill-muted" />
          )}
        </Avatar>
        <div className="flex h-14 flex-1 items-center justify-between gap-2 rounded-lg border border-neutral-500 p-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="댓글달기"
            maxLength={1000}
            className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!trimmed || isSubmitting}
            className="shrink-0 text-sm font-medium text-neutral-850 disabled:text-neutral-400"
          >
            게시
          </button>
        </div>
      </div>
    </div>
  )
}

export { CommentComposer }

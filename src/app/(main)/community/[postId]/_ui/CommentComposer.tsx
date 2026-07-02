'use client'

import { useState } from 'react'

interface CommentComposerProps {
  onSubmit: (body: string) => void | Promise<void>
  isSubmitting?: boolean
  /** 답글 대상 닉네임 — 있으면 답글 모드 배너 표시 */
  replyingToNickname?: string | null
  onCancelReply?: () => void
}

/**
 * 댓글/답글 입력창. 답글 모드에서는 대상 닉네임 배너 + 취소를 노출한다.
 * 제출 성공 후 입력값을 비운다.
 */
const CommentComposer = ({
  onSubmit,
  isSubmitting = false,
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
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={replyingToNickname ? '답글을 입력해주세요' : '댓글을 입력해주세요'}
          maxLength={1000}
          rows={1}
          className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-[#d3d3d3] px-4 py-3 text-sm outline-none focus:border-text-primary"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!trimmed || isSubmitting}
          className="h-11 shrink-0 rounded-full bg-fill-muted px-5 text-sm font-semibold text-text-primary disabled:opacity-50"
        >
          등록
        </button>
      </div>
    </div>
  )
}

export { CommentComposer }

'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui'
import { CommentComposerShell } from './CommentComposerShell'

interface CommentComposerProps {
  onSubmit: (body: string) => void | Promise<void>
  isSubmitting?: boolean
  hasSubmitError: boolean
  onClearSubmitError: () => void
  /** 작성자(나) 아바타 */
  profileImageUrl?: string
  /** 답글 대상 닉네임 — 있으면 답글 모드 배너 표시 */
  replyingToNickname?: string | null
  onCancelReply?: () => void
}

/**
 * 댓글/답글 입력창 — 아바타 + 뉴트럴 입력 필드 + 브랜드 컬러 게시 버튼.
 * 답글 모드에서는 대상 닉네임 배너 + 취소를 노출한다. 제출 성공 후 입력값을 비운다.
 */
const CommentComposer = ({
  onSubmit,
  isSubmitting = false,
  hasSubmitError,
  onClearSubmitError,
  profileImageUrl,
  replyingToNickname,
  onCancelReply,
}: CommentComposerProps) => {
  const [value, setValue] = useState('')
  const trimmed = value.trim()
  const inputRef = useRef<HTMLInputElement>(null)

  // 답글 대상이 잡히면 인풋에 바로 포커스 — 답글달기 클릭 후 곧장 타이핑할 수 있게
  useEffect(() => {
    if (replyingToNickname) inputRef.current?.focus()
  }, [replyingToNickname])

  // 실패해도 입력값은 남기고 재시도할 수 있게 — 오류 상태는 호출부 mutation을 단일 출처로 쓴다
  const handleSubmit = async () => {
    if (!trimmed || isSubmitting) return
    try {
      await onSubmit(trimmed)
      setValue('')
    } catch {
      // mutation의 isError로 안내하고, 이벤트 핸들러의 unhandled rejection만 막는다
    }
  }

  // [refactored] py-3 래퍼·아바타 마크업을 CommentComposerShell로 위임
  const banner = replyingToNickname && (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-primary-50 px-3 py-2 text-body-md text-primary-700">
      <span className="min-w-0 font-semibold break-words">@{replyingToNickname}에게 답글</span>
      <button
        type="button"
        onClick={onCancelReply}
        className="shrink-0 rounded-full px-2 py-1 text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        취소
      </button>
    </div>
  )

  const error = hasSubmitError && (
    <p role="alert" className="text-body-sm text-error-700">
      댓글 등록에 실패했습니다. 다시 시도해주세요.
    </p>
  )

  return (
    <CommentComposerShell profileImageUrl={profileImageUrl} banner={banner} footer={error}>
      <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-300 bg-base-white py-1 pr-1.5 pl-5 transition-[border-color,box-shadow] duration-150 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-point-500/45 motion-reduce:transition-none pc:h-14 pc:pl-6">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (hasSubmitError) onClearSubmitError()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              void handleSubmit()
            }
          }}
          aria-label={replyingToNickname ? '답글 입력' : '댓글 입력'}
          placeholder={replyingToNickname ? '답글을 남겨주세요' : '댓글을 남겨주세요'}
          maxLength={1000}
          className="h-full min-w-0 flex-1 bg-transparent text-body-lg font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!trimmed || isSubmitting}
          aria-busy={isSubmitting}
          className="h-10 min-w-14 shrink-0 px-3 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 motion-reduce:transition-none pc:h-11"
        >
          게시
        </Button>
      </div>
    </CommentComposerShell>
  )
}

export { CommentComposer }

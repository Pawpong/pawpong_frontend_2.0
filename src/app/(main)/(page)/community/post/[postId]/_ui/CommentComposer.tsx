'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, Input } from '@/shared/ui'
import { CommentComposerShell } from './CommentComposerShell'
import { commentSubmitFeedback } from './commentSubmitFeedback'

interface CommentComposerProps {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (body: string) => void | Promise<void>
  isSubmitting?: boolean
  hasSubmitError: boolean
  onClearSubmitError: () => void
  submitError?: unknown
  /** 작성자(나) 아바타 */
  profileImageUrl?: string
  /** 답글 대상 닉네임 — 있으면 답글 모드 배너 표시 */
  replyingToNickname?: string | null
  onCancelReply?: () => void
  onCheckComments?: () => void
  isCheckingComments?: boolean
}

/**
 * 댓글/답글 입력창 — 아바타 + 뉴트럴 입력 필드 + 브랜드 컬러 게시 버튼.
 * 답글 모드에서는 대상 닉네임 배너 + 취소를 노출한다. 제출 성공 후 입력값을 비운다.
 */
const CommentComposer = ({
  draft: value,
  onDraftChange: setValue,
  onSubmit,
  isSubmitting = false,
  hasSubmitError,
  onClearSubmitError,
  submitError,
  profileImageUrl,
  replyingToNickname,
  onCancelReply,
  onCheckComments,
  isCheckingComments,
}: CommentComposerProps) => {
  const trimmed = value.trim()
  const inputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const composingRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<unknown>(null)
  const [submitted, setSubmitted] = useState(false)
  const busy = isSubmitting || submitting

  // 답글 대상이 잡히면 인풋에 바로 포커스 — 답글달기 클릭 후 곧장 타이핑할 수 있게
  useEffect(() => {
    if (replyingToNickname) inputRef.current?.focus()
  }, [replyingToNickname])

  // 서버 응답을 확인한 뒤에만 초안을 지운다. 사전 검증 실패도 입력과 함께 표시한다.
  const handleSubmit = async () => {
    const body = inputRef.current?.value.trim() ?? trimmed
    if (!body || isSubmitting || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setLocalError(null)
    setSubmitted(false)
    if (hasSubmitError) onClearSubmitError()
    try {
      await onSubmit(body)
      setValue('')
      setSubmitted(true)
    } catch (error) {
      // mutation 전에 실패해도 아무 반응 없는 상태가 되지 않도록 입력값과 오류를 남긴다.
      setLocalError(error ?? new Error('댓글 등록을 확인하지 못했어요.'))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const banner = replyingToNickname && (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-action-subtle px-3 py-2 text-body-md text-neutral-850">
      <span className="min-w-0 font-semibold break-words">@{replyingToNickname}에게 답글</span>
      <Button
        intent="link"
        size="inline"
        disabled={busy}
        onClick={() => {
          onCancelReply?.()
          setLocalError(null)
          if (hasSubmitError) onClearSubmitError()
        }}
      >
        답글 취소
      </Button>
    </div>
  )

  const feedbackMessage = commentSubmitFeedback(localError ?? submitError)
  const error = (hasSubmitError || localError !== null) && (
    <div role="alert" className="text-body-sm text-error-700">
      <p>{feedbackMessage.message}</p>
      {feedbackMessage.needsConsent && (
        <Link href="/account/content-rights" className="font-semibold underline">
          앱 표시 동의하기
        </Link>
      )}
      {feedbackMessage.canCheck && onCheckComments && (
        <button
          type="button"
          className="min-h-11 rounded font-semibold underline focus-ring disabled:opacity-40"
          disabled={isCheckingComments || busy}
          onClick={onCheckComments}
        >
          {isCheckingComments ? '댓글 확인 중…' : '댓글 목록 다시 확인'}
        </button>
      )}
    </div>
  )

  const feedback = error || (
    <p
      role="status"
      aria-live="polite"
      className={submitted || busy ? 'text-body-sm text-neutral-700' : 'sr-only'}
    >
      {submitted ? '댓글을 게시했어요.' : busy ? '댓글을 게시하고 있어요…' : ''}
    </p>
  )

  return (
    <CommentComposerShell profileImageUrl={profileImageUrl} banner={banner} footer={feedback}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
        aria-busy={busy}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <Input
          ref={inputRef}
          type="text"
          value={value}
          readOnly={busy}
          enterKeyHint="send"
          onChange={(e) => {
            setValue(e.target.value)
            setLocalError(null)
            setSubmitted(false)
            if (hasSubmitError) onClearSubmitError()
          }}
          onCompositionStart={() => {
            composingRef.current = true
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false
            setValue(e.currentTarget.value)
          }}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              (composingRef.current || e.nativeEvent.isComposing || e.keyCode === 229)
            ) {
              e.preventDefault()
            }
          }}
          aria-label={replyingToNickname ? '답글 입력' : '댓글 입력'}
          placeholder={replyingToNickname ? '답글을 남겨주세요' : '댓글을 남겨주세요'}
          maxLength={1000}
          className="min-w-0 flex-1"
        />
        {/* 채팅 보내기와 같은 폭 — 진행 상태는 아래 안내 문구가 알려 주므로 라벨은 고정한다 */}
        <div className="flex min-w-14 shrink-0">
          <Button
            size="md"
            type="submit"
            // iOS 26은 pointerdown 취소 후에도 입력 포커스를 해제한다(WebKit #322721).
            // 호환 mousedown에서 포커스 이동만 막고, click → form 제출은 그대로 유지한다.
            onMouseDown={(e) => e.preventDefault()}
            disabled={!trimmed || busy}
            aria-busy={busy}
            width="full"
          >
            게시
          </Button>
        </div>
      </form>
    </CommentComposerShell>
  )
}

export { CommentComposer }

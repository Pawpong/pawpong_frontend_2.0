'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { isApiError } from '@/shared/api'
import { Button } from '@/shared/ui'
import { CommentComposerShell } from './CommentComposerShell'

interface CommentComposerProps {
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
  submitError,
  profileImageUrl,
  replyingToNickname,
  onCancelReply,
}: CommentComposerProps) => {
  const [value, setValue] = useState('')
  const trimmed = value.trim()
  const inputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const composingRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const busy = isSubmitting || submitting

  // 답글 대상이 잡히면 인풋에 바로 포커스 — 답글달기 클릭 후 곧장 타이핑할 수 있게
  useEffect(() => {
    if (replyingToNickname) inputRef.current?.focus()
  }, [replyingToNickname])

  // 실패해도 입력값은 남기고 재시도할 수 있게 — 오류 상태는 호출부 mutation을 단일 출처로 쓴다
  const handleSubmit = async () => {
    const body = inputRef.current?.value.trim() ?? trimmed
    if (!body || isSubmitting || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setLocalError(false)
    setSubmitted(false)
    if (hasSubmitError) onClearSubmitError()
    try {
      await onSubmit(body)
      setValue('')
      setSubmitted(true)
    } catch {
      // mutation 전에 실패해도 아무 반응 없는 상태가 되지 않도록 입력값과 오류를 남긴다.
      setLocalError(true)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  // [refactored] py-3 래퍼·아바타 마크업을 CommentComposerShell로 위임
  const banner = replyingToNickname && (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-primary-50 px-3 py-2 text-body-md text-primary-700">
      <span className="min-w-0 font-semibold break-words">@{replyingToNickname}에게 답글</span>
      <Button intent="link" size="inline" onClick={onCancelReply}>
        취소
      </Button>
    </div>
  )

  const needsConsent =
    isApiError(submitError) &&
    submitError.status === 403 &&
    typeof submitError.message === 'string' &&
    submitError.message.includes('앱 표시 동의')
  const error = (hasSubmitError || localError) && (
    <div role="alert" className="text-body-sm text-error-700">
      <p>
        {needsConsent
          ? '앱에서 댓글을 남기려면 게시물 표시 동의가 필요해요.'
          : isApiError(submitError) && submitError.status === 401
            ? '로그인이 만료됐어요. 다시 로그인해 주세요.'
            : '댓글 등록에 실패했습니다. 입력한 글은 남아 있으니 다시 시도해주세요.'}
      </p>
      {needsConsent && (
        <Link href="/account/content-rights" className="font-semibold underline">
          앱 표시 동의하기
        </Link>
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
        className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-neutral-300 bg-base-white py-1 pr-1.5 pl-5 transition-[border-color,box-shadow] duration-150 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-point-500/45 motion-reduce:transition-none pc:h-14 pc:pl-6"
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          readOnly={busy}
          enterKeyHint="send"
          onChange={(e) => {
            setValue(e.target.value)
            setLocalError(false)
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
          className="h-full min-w-0 flex-1 bg-transparent text-body-lg font-medium text-neutral-850 outline-none placeholder:text-neutral-500"
        />
        <div className="flex w-24 shrink-0">
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
            {busy ? '게시 중…' : '게시'}
          </Button>
        </div>
      </form>
    </CommentComposerShell>
  )
}

export { CommentComposer }

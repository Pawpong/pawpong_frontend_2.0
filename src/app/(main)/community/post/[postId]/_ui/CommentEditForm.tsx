'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/shared/ui'
import type { CommentActionsController } from './useCommentActions'

export function CommentEditForm({
  actions,
  currentBody,
}: {
  actions: CommentActionsController
  currentBody?: string
}) {
  const field = useRef<HTMLTextAreaElement>(null)
  const action = actions.active
  useEffect(() => {
    if (!actions.isBusy) field.current?.focus()
  }, [action?.intent, actions.isBusy])
  if (!action || action.mode !== 'edit') return null
  return (
    <form
      aria-busy={actions.isBusy}
      className="mt-1 flex min-w-0 flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void actions.submit()
      }}
    >
      <textarea
        ref={field}
        aria-label="댓글 수정 내용"
        value={action.draft}
        onChange={(event) => actions.setDraft(event.target.value)}
        disabled={actions.isBusy}
        maxLength={1000}
        rows={3}
        className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-text-primary disabled:bg-neutral-50"
      />
      {currentBody !== undefined && currentBody !== action.comment.body && (
        <p className="text-xs leading-relaxed break-words text-neutral-600">
          현재 게시된 내용: {currentBody}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={!action.draft.trim() || actions.isBusy}>
          {actions.isBusy && !actions.isChecking ? '저장 중…' : '저장'}
        </Button>
        <Button
          type="button"
          intent="secondary"
          size="sm"
          onClick={actions.cancel}
          disabled={actions.isBusy}
        >
          취소
        </Button>
        {action.error && (
          <Button
            type="button"
            intent="ghost"
            size="sm"
            onClick={() => void actions.recheck()}
            disabled={actions.isBusy}
          >
            {actions.isChecking ? '목록 확인 중…' : '목록 다시 확인'}
          </Button>
        )}
      </div>
      {action.error && (
        <p role="alert" className="text-xs leading-relaxed text-error-700">
          {action.error}
        </p>
      )}
    </form>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import type { CommentActionsController } from './useCommentActions'
import { commentActionTriggerId } from './commentAction'

export function CommentActionFeedback({ notice }: { notice: CommentActionsController['notice'] }) {
  const feedback = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (!notice) return
    const target = notice.commentId
      ? document.getElementById(commentActionTriggerId(notice.commentId))
      : null
    ;(target ?? feedback.current)?.focus()
  }, [notice])
  if (!notice) return null
  return (
    <p
      ref={feedback}
      role="status"
      tabIndex={-1}
      className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 focus-ring"
    >
      {notice.message}
    </p>
  )
}

'use client'

import { useState } from 'react'
import { useCreateReviewReply, useUpdateReviewReply } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { AlertMessage, Button, TextareaField } from '@/shared/ui'

export const ReviewReplyForm = ({
  reviewId,
  initialContent,
  onDone,
}: {
  reviewId: string
  initialContent: string
  onDone: () => void
}) => {
  const [content, setContent] = useState(initialContent)
  const createReply = useCreateReviewReply()
  const updateReply = useUpdateReviewReply()
  const mutation = initialContent ? updateReply : createReply
  const trimmed = content.trim()

  const submit = () => {
    if (!trimmed || mutation.isPending) return
    mutation.mutate({ reviewId, data: { content: trimmed } }, { onSuccess: onDone })
  }

  const errorMessage = mutation.isError
    ? normalizeApiError(mutation.error, '답글을 저장하지 못했습니다.').message
    : null

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-primary-50 p-4 tab:p-5">
      <TextareaField
        aria-label="후기 답글"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="답글을 입력해 주세요."
        maxLength={800}
        currentLength={content.length}
        className="min-h-20"
        disabled={mutation.isPending}
      />
      {errorMessage && <AlertMessage status="error" size="responsive" message={errorMessage} />}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="px-4"
          onClick={onDone}
          disabled={mutation.isPending}
        >
          취소
        </Button>
        <Button
          size="sm"
          className="px-4"
          disabled={!trimmed || mutation.isPending}
          onClick={submit}
        >
          {mutation.isPending ? '저장하는 중' : '저장'}
        </Button>
      </div>
    </div>
  )
}

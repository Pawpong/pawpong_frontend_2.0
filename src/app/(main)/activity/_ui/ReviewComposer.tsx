'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { normalizeApiError } from '@/shared/api'
import { useCreateReview } from '@/features/adopter'
import { AlertMessage, Button, TextareaField } from '@/shared/ui'

interface ReviewComposerProps {
  applicationId: string
  breederName: string
  reviewType: 'consultation' | 'adoption'
}

const ReviewComposer = ({ applicationId, breederName, reviewType }: ReviewComposerProps) => {
  const router = useRouter()
  const createReview = useCreateReview()
  const [content, setContent] = useState('')
  const trimmedContent = content.trim()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedContent || createReview.isPending) return

    createReview.mutate(
      { applicationId, reviewType, content: trimmedContent },
      {
        onSuccess: (review) => {
          router.replace(`/activity/reviews/${review.reviewId}`)
        },
      },
    )
  }

  const errorMessage = createReview.isError
    ? normalizeApiError(createReview.error, '후기를 등록하지 못했습니다.').message
    : null

  return (
    <section className="rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="font-cafe24 text-base text-primary-600 tab:text-lg">
          {reviewType === 'adoption' ? '입양 후기 작성' : '상담 후기 작성'}
        </h2>
        <p className="text-sm leading-[1.5] font-medium text-neutral-700">
          {breederName} 브리더와의 경험을 솔직하게 들려주세요.
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextareaField
          label="후기"
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="상담 과정과 좋았던 점을 입력해 주세요."
          maxLength={1000}
          currentLength={content.length}
          className="min-h-40"
          disabled={createReview.isPending}
        />

        {errorMessage && <AlertMessage status="error" size="responsive" message={errorMessage} />}

        <Button
          type="submit"
          size="lg"
          disabled={!trimmedContent || createReview.isPending}
          className="w-full tab:w-48 tab:self-end"
        >
          {createReview.isPending ? '등록하는 중' : '후기 등록'}
        </Button>
      </form>
    </section>
  )
}

export { ReviewComposer }

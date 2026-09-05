'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import {
  useCreateReviewReply,
  useDeleteReviewReply,
  useUpdateReviewReply,
} from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { formatDate } from '@/shared/lib/formatDate'
import {
  AlertMessage,
  Badge,
  Button,
  Container,
  DeleteConfirmModal,
  InfiniteScrollTrigger,
  ListState,
  TextareaField,
} from '@/shared/ui'
import type { BreederMyReviewItem } from '@/shared/types'

const REVIEW_TYPE_LABEL: Record<string, string> = {
  adoption: '입양 후기',
  visit: '방문 후기',
}

const ReviewReplyForm = ({
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
    <div className="flex flex-col gap-2 rounded-lg bg-primary-50/60 p-3">
      <TextareaField
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

const ReviewRow = ({ review }: { review: BreederMyReviewItem }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteReply = useDeleteReviewReply()

  return (
    <div className="flex flex-col gap-3 px-4 py-4 tab:px-5 tab:py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-neutral-850 tab:text-base">
          {review.adopterName}
        </span>
        {review.type && (
          <Badge variant="primaryOutline" size="md">
            {REVIEW_TYPE_LABEL[review.type] ?? review.type}
          </Badge>
        )}
        <span className="text-xs font-medium text-neutral-500">{review.rating.toFixed(1)}점</span>
      </div>

      {review.petName && (
        <span className="text-xs font-medium text-neutral-700">{review.petName}</span>
      )}

      <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-850">
        {review.content}
      </p>

      <span className="text-xs font-medium text-neutral-500">{formatDate(review.writtenAt)}</span>

      {isEditing ? (
        <ReviewReplyForm
          reviewId={review.reviewId}
          initialContent={review.replyContent ?? ''}
          onDone={() => setIsEditing(false)}
        />
      ) : review.replyContent ? (
        <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3">
          <p className="text-xs font-semibold text-primary-600">내 답글</p>
          <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-700">
            {review.replyContent}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="px-4" onClick={() => setIsEditing(true)}>
              수정
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-4"
              onClick={() => setShowDeleteConfirm(true)}
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="self-end px-4"
          onClick={() => setIsEditing(true)}
        >
          답글 달기
        </Button>
      )}

      <DeleteConfirmModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        target="답글"
        isPending={deleteReply.isPending}
        onConfirm={() =>
          deleteReply.mutate(review.reviewId, { onSuccess: () => setShowDeleteConfirm(false) })
        }
      />
    </div>
  )
}

const ReceivedReviewList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(breederQueries.myReviews({}, 20))
  const reviews = dedupeBy(flattenPages(data), (review) => review.reviewId)

  return (
    <Container className="px-4 py-5 tab:py-8 pc:py-10">
      <div className="mx-auto w-full max-w-168 pc:max-w-[59.25rem]">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={reviews.length === 0}
          loadingText="받은 후기를 불러오는 중입니다."
          errorText="받은 후기를 불러오지 못했습니다."
          emptyText="아직 받은 후기가 없습니다."
          errorAction={
            <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        >
          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
              받은 후기
            </h2>
            <div className="divide-y divide-neutral-150">
              {reviews.map((review) => (
                <ReviewRow key={review.reviewId} review={review} />
              ))}
            </div>
          </section>
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { ReceivedReviewList }

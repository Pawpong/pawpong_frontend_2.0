'use client'

import Link from 'next/link'
import { ActivityDetailFlow, ActivitySummary } from './ActivityDetailFlow'
import { useState } from 'react'
import { useDeleteReviewReply } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { TEXT } from '@/shared/config'
import { formatDate } from '@/shared/lib/formatDate'
import {
  AlertMessage,
  Badge,
  buttonVariants,
  Button,
  DeleteConfirmModal,
  OwnerActionsMenu,
  ReviewTypeBadge,
} from '@/shared/ui'
import type { BreederMyReviewItem } from '@/shared/types'
import { ActivityIdentity } from './ActivityIdentity'
import { ReviewReplyForm } from './ReviewReplyForm'

export const ReceivedReviewRow = ({
  review,
  detail = false,
}: {
  review: BreederMyReviewItem
  detail?: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteReply = useDeleteReviewReply()

  const content = (
    <>
      {!detail && (
        <ActivityIdentity
          name={review.adopterName}
          meta={`작성일 ${formatDate(review.writtenAt)}`}
          badge={review.type && <ReviewTypeBadge reviewType={review.type} />}
        />
      )}

      {detail && (
        <header className="border-b border-neutral-150 pb-6">
          <p className={TEXT.meta}>상담과 입양 후 남겨 주신 이야기</p>
          <h1 className={`${TEXT.display} mt-2`}>받은 후기</h1>
        </header>
      )}
      {review.petName && (
        <p className={TEXT.sub}>
          상담한 아이 · <span className="font-semibold text-neutral-850">{review.petName}</span>
        </p>
      )}

      <p className={`${TEXT.prose} [overflow-wrap:anywhere] break-words`}>{review.content}</p>

      {!detail && (
        <Link
          href={`/activity/received-reviews/${review.reviewId}`}
          className={buttonVariants({
            variant: 'text',
            className: 'min-h-10 self-start text-primary-600',
          })}
        >
          후기 자세히 보기 →
        </Link>
      )}
      {detail && (
        <div className="border-t border-neutral-150 pt-8">
          <h2 className={TEXT.section}>내 답글</h2>
          <p className={`${TEXT.sub} mt-2`}>남겨 주신 이야기에 답해 주세요.</p>
        </div>
      )}
      {isEditing ? (
        <ReviewReplyForm
          reviewId={review.reviewId}
          initialContent={review.replyContent ?? ''}
          onDone={() => setIsEditing(false)}
        />
      ) : review.replyContent ? (
        <div className="flex flex-col gap-3 rounded-lg bg-primary-50 p-4 tab:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className={TEXT.body}>내 답글</p>
            <OwnerActionsMenu
              ariaLabel="내 답글 관리"
              onEdit={() => setIsEditing(true)}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </div>
          <p className={`${TEXT.prose} [overflow-wrap:anywhere] break-words`}>
            {review.replyContent}
          </p>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="self-start px-4"
          onClick={() => setIsEditing(true)}
        >
          답글 달기
        </Button>
      )}

      {deleteReply.isError && (
        <AlertMessage
          status="error"
          message={normalizeApiError(deleteReply.error, '답글을 삭제하지 못했습니다.').message}
        />
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
    </>
  )
  if (!detail)
    return (
      <li className="flex min-w-0 flex-col gap-4 rounded-xl border border-neutral-150 bg-white p-5 tab:p-6">
        {content}
      </li>
    )
  return (
    <ActivityDetailFlow
      summary={
        <ActivitySummary label="후기를 남긴 분" name={review.adopterName}>
          {review.type && (
            <div>
              <ReviewTypeBadge reviewType={review.type} />
            </div>
          )}
          <p className={TEXT.meta}>작성일 {formatDate(review.writtenAt)}</p>
          <div>
            <Badge variant={review.isVisible ? 'primaryOutline' : 'neutralFilled'} size="md">
              {review.isVisible ? '공개 중' : '비공개'}
            </Badge>
          </div>
          {review.replyWrittenAt && (
            <p className={TEXT.meta}>답글 작성일 {formatDate(review.replyWrittenAt)}</p>
          )}
          {review.replyUpdatedAt && (
            <p className={TEXT.meta}>답글 수정일 {formatDate(review.replyUpdatedAt)}</p>
          )}
        </ActivitySummary>
      }
    >
      <article className="flex min-w-0 flex-col gap-6">{content}</article>
    </ActivityDetailFlow>
  )
}

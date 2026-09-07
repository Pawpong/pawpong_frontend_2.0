'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages, getTotalItems } from '@/shared/lib/infiniteList'
import { formatDate } from '@/shared/lib/formatDate'
// [refactored] 타입 배지는 공용 ReviewTypeBadge 사용 (라우트마다 복붙하던 매핑 제거)
import { Button, Container, InfiniteScrollTrigger, ListState, ReviewTypeBadge } from '@/shared/ui'
import type { PublicReviewDto } from '@/shared/types'

const REVIEW_PAGE_SIZE = 10

const ReviewRow = ({ review }: { review: PublicReviewDto }) => (
  <article className="flex flex-col gap-3 px-4 py-4 tab:px-5 tab:py-5">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-neutral-850 tab:text-base">
        {review.adopterName}
      </span>
      <ReviewTypeBadge reviewType={review.type} />
    </div>

    {review.petName && (
      <span className="text-xs font-medium text-neutral-700">{review.petName}</span>
    )}

    <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-850">
      {review.content}
    </p>

    <span className="text-xs font-medium text-neutral-500">{formatDate(review.writtenAt)}</span>

    {/* 답글 작성·수정은 브리더 본인의 '받은 후기'(ReceivedReviewList)에서만 한다. 여기선 읽기 전용 */}
    {review.replyContent && (
      <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3">
        <p className="text-xs font-semibold text-primary-600">브리더 답글</p>
        <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-700">
          {review.replyContent}
        </p>
        {review.replyWrittenAt && (
          <span className="text-xs font-medium text-neutral-500">
            {formatDate(review.replyWrittenAt)}
          </span>
        )}
      </div>
    )}
  </article>
)

interface PublicBreederReviewsProps {
  breederId: string
}

/** 브리더 공개 홈의 후기 목록. 입양자가 신청 상세에서 남긴 후기가 여기로 노출된다. */
const PublicBreederReviews = ({ breederId }: PublicBreederReviewsProps) => {
  const query = useInfiniteQuery({
    ...breederQueries.reviews(breederId, REVIEW_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const reviews = dedupeBy(flattenPages(query.data), (review) => review.reviewId)
  const totalItems = getTotalItems(query.data)

  return (
    <Container className="px-4 py-5 tab:px-20 tab:py-10 pc:px-0">
      <div className="mx-auto flex w-full max-w-[74.625rem] flex-col gap-5">
        <p className="px-0.5 text-sm leading-6 font-semibold text-neutral-850 tab:text-base">
          전체 후기 {totalItems}
        </p>

        <ListState
          isPending={query.isPending}
          isError={query.isError}
          isEmpty={reviews.length === 0}
          loadingText="후기를 불러오는 중입니다."
          errorText="후기를 불러오지 못했습니다."
          emptyText="아직 등록된 후기가 없습니다."
          errorAction={
            <Button variant="fill" size="sm" onClick={() => void query.refetch()}>
              다시 시도
            </Button>
          }
        >
          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <div className="divide-y divide-neutral-150">
              {reviews.map((review) => (
                <ReviewRow key={review.reviewId} review={review} />
              ))}
            </div>
          </section>
        </ListState>

        <InfiniteScrollTrigger
          onIntersect={query.fetchNextPage}
          hasNextPage={!!query.hasNextPage}
          isFetchingNextPage={query.isFetchingNextPage}
        />
      </div>
    </Container>
  )
}

export { PublicBreederReviews }

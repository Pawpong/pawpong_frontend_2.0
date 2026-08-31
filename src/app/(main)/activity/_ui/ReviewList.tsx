'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { ArrowRightIcon } from '@/shared/assets'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { formatDate } from '@/shared/lib/formatDate'
import { flattenPages } from '@/shared/lib/infiniteList'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Container,
  InfiniteScrollTrigger,
  ListState,
} from '@/shared/ui'
import type { MyReviewItemDto } from '@/shared/types'
import { ReviewTypeBadge } from './ActivityBadges'

const ReviewRow = ({ review }: { review: MyReviewItemDto }) => (
  <Link
    href={`/activity/reviews/${review.reviewId}`}
    className="group flex min-h-32 items-start gap-3 px-4 py-4 transition-colors hover:bg-primary-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 tab:gap-4 tab:px-5 tab:py-5"
  >
    <Avatar size="md" className="size-12 bg-neutral-100 tab:size-14">
      {review.breederProfileImage && (
        <AvatarImage
          src={review.breederProfileImage}
          alt={`${review.breederNickname || '브리더'} 프로필`}
        />
      )}
      <AvatarFallback />
    </Avatar>

    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-semibold text-neutral-850 tab:text-base">
          {review.breederNickname || '알 수 없는 브리더'}
        </span>
        <ReviewTypeBadge reviewType={review.reviewType} />
      </span>
      <span className="line-clamp-2 text-sm leading-[1.5] font-medium text-neutral-700">
        {review.content}
      </span>
      <span className="text-xs font-medium text-neutral-500">{formatDate(review.writtenAt)}</span>
    </span>

    <ArrowRightIcon className="mt-1 size-5 shrink-0 text-neutral-500 transition-colors group-hover:text-primary-500" />
  </Link>
)

const ReviewList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteQuery(adopterQueries.reviews(20))
  const reviews = useMemo(() => dedupeBy(flattenPages(data), (review) => review.reviewId), [data])

  return (
    <Container className="px-4 py-5 tab:py-8 pc:py-10">
      <div className="mx-auto w-full max-w-168 pc:max-w-[59.25rem]">
        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={reviews.length === 0}
          loadingText="후기를 불러오는 중입니다."
          errorText="후기를 불러오지 못했습니다."
          emptyText="아직 작성한 후기가 없습니다."
          errorAction={
            <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        >
          <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
            <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
              작성한 후기
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

export { ReviewList }

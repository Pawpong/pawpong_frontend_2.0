'use client'

import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { flattenPages } from '@/shared/lib/infiniteList'
import { EmptyState } from '@/shared/ui'
import { ActivityDetailLayout } from '../../../_ui/ActivityDetailLayout'
import { ReceivedReviewRow } from '../../../_ui/ReceivedReviewRow'

export const ReceivedReviewDetailContent = ({ reviewId }: { reviewId: string }) => {
  // 받은 후기에는 단건 API가 없어 기존 목록 API를 끝까지 조회해 직접 진입도 지원한다.
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery(breederQueries.myReviews({}, 20))
  const review = flattenPages(data).find((item) => item.reviewId === reviewId)
  useEffect(() => {
    if (!review && hasNextPage && !isFetching && !isError) void fetchNextPage()
  }, [review, hasNextPage, isFetching, isError, fetchNextPage])

  return (
    <ActivityDetailLayout
      title="받은 후기"
      backHref="/activity?tab=reviews"
      isPending={isPending || (!review && !!hasNextPage && !isError)}
      isError={isError}
      hasData={!!review}
      onRetry={() => void refetch()}
    >
      {review ? (
        <ReceivedReviewRow review={review} detail />
      ) : (
        !isPending && !hasNextPage && !isError && <EmptyState message="후기를 찾을 수 없습니다." />
      )}
    </ActivityDetailLayout>
  )
}

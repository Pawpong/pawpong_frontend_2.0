'use client'

import { breederQueries } from '@/entities/breeder'
import { ActivityInfiniteList } from './ActivityInfiniteList'
import { ReceivedReviewRow } from './ReceivedReviewRow'

const ReceivedReviewList = () => (
  <ActivityInfiniteList
    query={breederQueries.myReviews({}, 20)}
    title="받은 후기"
    description="함께한 상담과 입양의 이야기에 답글을 남겨 보세요."
    emptyText="아직 받은 후기가 없습니다."
    keyOf={(review) => review.reviewId}
    renderItem={(review) => <ReceivedReviewRow key={review.reviewId} review={review} />}
  />
)

export { ReceivedReviewList }

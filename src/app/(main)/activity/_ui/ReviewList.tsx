'use client'

import { adopterQueries } from '@/entities/adopter'
import { ActivityInfiniteList } from './ActivityInfiniteList'
import { SentReviewRow } from './ActivityRows'

const ReviewList = () => (
  <ActivityInfiniteList
    query={adopterQueries.reviews(20)}
    title="보낸 후기"
    description="상담과 입양을 마치고 남긴 이야기를 모았어요."
    emptyText="아직 작성한 후기가 없습니다."
    keyOf={(item) => item.reviewId}
    renderItem={(item) => <SentReviewRow key={item.reviewId} review={item} />}
  />
)

export { ReviewList }

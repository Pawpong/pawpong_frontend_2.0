import type { CommunityPostReview } from '@/shared/types'

export function CommunityReviewLabel({ review }: { review?: CommunityPostReview }) {
  if (!review || review.state === 'approved') return null
  return (
    <span className="inline-flex border border-primary-300 bg-point-50 px-2 py-1 text-[0.6875rem] font-bold text-primary-800">
      나만 확인 중 · 공개 보류
    </span>
  )
}

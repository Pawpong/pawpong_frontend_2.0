import { requireAuth } from '@/features/auth/server'
import { ReviewDetailContent } from './_ui/ReviewDetailContent'

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>
}

const ReviewDetailPage = async ({ params }: ReviewDetailPageProps) => {
  const { reviewId } = await params
  // 내가 쓴 후기 상세 — 소유권은 API가 검증한다. 브리더가 받은 후기는 received-reviews 로 간다.
  await requireAuth(`/activity/reviews/${reviewId}`)

  return <ReviewDetailContent reviewId={reviewId} backHref="/activity?tab=reviews" />
}

export default ReviewDetailPage

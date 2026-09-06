import { requireAuth } from '@/features/auth/server'
import { ReviewDetailContent } from './_ui/ReviewDetailContent'

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>
}

const ReviewDetailPage = async ({ params }: ReviewDetailPageProps) => {
  const { reviewId } = await params
  // 브리더도 다른 브리더에게 후기를 쓸 수 있어 입양자로 제한하지 않는다 — 소유권은 API가 검증한다.
  await requireAuth(`/activity/reviews/${reviewId}`)

  return <ReviewDetailContent reviewId={reviewId} />
}

export default ReviewDetailPage

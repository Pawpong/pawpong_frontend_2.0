import { requireRole } from '@/features/auth/server'
import { ReviewDetailContent } from './_ui/ReviewDetailContent'

interface ReviewDetailPageProps {
  params: Promise<{ reviewId: string }>
}

const ReviewDetailPage = async ({ params }: ReviewDetailPageProps) => {
  const { reviewId } = await params
  await requireRole('adopter', `/activity/reviews/${reviewId}`)

  return <ReviewDetailContent reviewId={reviewId} />
}

export default ReviewDetailPage

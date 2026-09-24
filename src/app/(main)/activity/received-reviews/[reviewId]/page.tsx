import { requireAuth } from '@/features/auth/server'
import { ReceivedReviewDetailContent } from './_ui/ReceivedReviewDetailContent'

export default async function ReceivedReviewPage({
  params,
}: {
  params: Promise<{ reviewId: string }>
}) {
  const { reviewId } = await params
  await requireAuth(`/activity/received-reviews/${reviewId}`)
  return <ReceivedReviewDetailContent reviewId={reviewId} />
}

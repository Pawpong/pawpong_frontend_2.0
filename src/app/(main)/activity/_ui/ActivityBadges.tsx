import { Badge } from '@/shared/ui'
import type { ApplicationStatus } from '@/shared/types'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  consultation_pending: '상담 대기',
  consultation_completed: '상담 완료',
  adoption_approved: '입양 확정',
  adoption_rejected: '진행 종료',
}

const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const variant =
    status === 'adoption_approved'
      ? 'primaryFilled'
      : status === 'consultation_completed'
        ? 'pointFilled'
        : status === 'adoption_rejected'
          ? 'neutralFilled'
          : 'primaryOutline'

  return (
    <Badge variant={variant} size="md">
      {STATUS_LABEL[status]}
    </Badge>
  )
}

const ReviewTypeBadge = ({ reviewType }: { reviewType: string }) => (
  <Badge variant={reviewType === 'adoption' ? 'primaryFilled' : 'pointFilled'} size="md">
    {reviewType === 'adoption' ? '입양 후기' : '상담 후기'}
  </Badge>
)

const getReviewTypeForStatus = (status: ApplicationStatus): 'consultation' | 'adoption' | null => {
  if (status === 'consultation_completed') return 'consultation'
  if (status === 'adoption_approved') return 'adoption'
  return null
}

export { ApplicationStatusBadge, ReviewTypeBadge, getReviewTypeForStatus }

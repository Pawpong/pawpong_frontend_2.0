// [refactored] ReviewTypeBadge 는 shared/ui 로 옮겼다. 기존 import 경로를 깨지 않으려고 여기서 재수출한다.
import { Badge, ReviewTypeBadge } from '@/shared/ui'
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

const getReviewTypeForStatus = (status: ApplicationStatus): 'consultation' | 'adoption' | null => {
  if (status === 'consultation_completed') return 'consultation'
  if (status === 'adoption_approved') return 'adoption'
  return null
}

export { ApplicationStatusBadge, ReviewTypeBadge, getReviewTypeForStatus }

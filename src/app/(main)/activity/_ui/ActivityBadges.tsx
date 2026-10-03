// [refactored] ReviewTypeBadge 는 shared/ui 로 옮겼다. 기존 import 경로를 깨지 않으려고 여기서 재수출한다.
import type { ComponentProps } from 'react'
import { Badge, ReviewTypeBadge } from '@/shared/ui'
import type { ApplicationStatus } from '@/shared/types'

// [refactored] 라벨 테이블 + 중첩 삼항 variant 선택을 한 룩업 테이블로 합침
const STATUS_BADGE: Record<
  ApplicationStatus,
  { label: string; variant: ComponentProps<typeof Badge>['variant'] }
> = {
  consultation_pending: { label: '상담 대기', variant: 'primaryOutline' },
  consultation_completed: { label: '상담 완료', variant: 'pointFilled' },
  adoption_approved: { label: '입양 확정', variant: 'primaryFilled' },
  adoption_rejected: { label: '진행 종료', variant: 'neutralFilled' },
}

const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <Badge variant={STATUS_BADGE[status].variant} size="responsive">
    {STATUS_BADGE[status].label}
  </Badge>
)

const getReviewTypeForStatus = (status: ApplicationStatus): 'consultation' | 'adoption' | null => {
  if (status === 'consultation_completed') return 'consultation'
  if (status === 'adoption_approved') return 'adoption'
  return null
}

export { ApplicationStatusBadge, ReviewTypeBadge, getReviewTypeForStatus }

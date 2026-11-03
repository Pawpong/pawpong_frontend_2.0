// [refactored] ReviewTypeBadge 는 shared/ui 로 옮겼다. 기존 import 경로를 깨지 않으려고 여기서 재수출한다.
import { ReviewTypeBadge, StatusLabel, type StatusTone } from '@/shared/ui'
import type { ApplicationStatus } from '@/shared/types'

// 신청 상태 라벨·표시 tone 룩업 테이블
const STATUS_BADGE: Record<ApplicationStatus, { label: string; tone: StatusTone }> = {
  consultation_pending: { label: '상담 대기', tone: 'waiting' },
  consultation_completed: { label: '상담 완료', tone: 'talk' },
  adoption_approved: { label: '입양 확정', tone: 'available' },
  adoption_rejected: { label: '진행 종료', tone: 'neutral' },
  adoption_cancelled: { label: '신청 취소', tone: 'neutral' },
}

const ApplicationStatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <StatusLabel tone={STATUS_BADGE[status].tone}>{STATUS_BADGE[status].label}</StatusLabel>
)

const getReviewTypeForStatus = (status: ApplicationStatus): 'consultation' | 'adoption' | null => {
  if (status === 'consultation_completed') return 'consultation'
  if (status === 'adoption_approved') return 'adoption'
  return null
}

export { ApplicationStatusBadge, ReviewTypeBadge, getReviewTypeForStatus }

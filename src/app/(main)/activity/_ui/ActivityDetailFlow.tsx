import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'
import type { ApplicationStatus } from '@/shared/types'
import { ApplicationStatusBadge } from './ActivityBadges'

export const ActivityDetailFlow = ({
  summary,
  header,
  children,
}: {
  summary: ReactNode
  header?: ReactNode
  children: ReactNode
}) => (
  <div className="flex min-w-0 flex-col gap-8 tab:gap-10">
    {header}
    <div className="grid min-w-0 gap-8 pc:grid-cols-[20rem_minmax(0,1fr)] pc:gap-16">
      <aside className="min-w-0 border-b border-neutral-150 pb-8 pc:border-r pc:border-b-0 pc:pr-8 pc:pb-0">
        <div className="flex flex-col gap-6 pc:sticky pc:top-24">{summary}</div>
      </aside>
      <div className="flex min-w-0 flex-col gap-10">{children}</div>
    </div>
  </div>
)

const STATUS_COPY: Record<ApplicationStatus, { title: string; sent: string; received: string }> = {
  consultation_pending: {
    title: '상담을 준비하고 있어요',
    sent: '보낸 신청서를 확인하고, 브리더와 채팅으로 상담을 이어가세요.',
    received: '신청서를 읽고 신청자와 상담해 주세요. 상담을 마치면 완료로 표시할 수 있어요.',
  },
  consultation_completed: {
    title: '상담을 마쳤어요',
    sent: '브리더와 입양 계획을 조율하고, 상담 경험을 후기로 남겨 보세요.',
    received: '상담 내용을 바탕으로 입양 진행 여부를 결정해 주세요.',
  },
  adoption_approved: {
    title: '입양이 확정되었어요',
    sent: '브리더와 남은 일정을 이야기하고 입양 후기를 남겨 보세요.',
    received: '입양이 확정된 신청입니다. 남은 일정은 신청자와 채팅으로 이야기해 주세요.',
  },
  adoption_rejected: {
    title: '신청이 종료되었어요',
    sent: '이번 신청은 진행이 종료되었어요. 보냈던 신청 내용은 계속 확인할 수 있어요.',
    received: '진행이 종료된 신청입니다. 신청서와 상담 기록을 확인할 수 있어요.',
  },
}

export const ApplicationProgress = ({
  status,
  received = false,
}: {
  status: ApplicationStatus
  received?: boolean
}) => {
  const copy = STATUS_COPY[status]
  const step = status === 'consultation_pending' ? 0 : status === 'consultation_completed' ? 1 : 2
  return (
    <header className="border-b border-neutral-150 pb-8">
      <ApplicationStatusBadge status={status} />
      <h1 className={`${TEXT.display} mt-4`}>{copy.title}</h1>
      <p className={`${TEXT.sub} mt-3`}>{received ? copy.received : copy.sent}</p>
      {status !== 'adoption_rejected' && (
        <ol aria-label="신청 진행 단계" className="mt-6 grid grid-cols-3 gap-2">
          {['상담 대기', '상담 완료', '입양 확정'].map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? 'step' : undefined}
              className={`border-t-2 pt-3 text-sm ${index <= step ? 'border-primary-500 font-semibold text-primary-500' : 'border-neutral-150 text-neutral-500'}`}
            >
              {label}
              {index === step && <span className="sr-only"> · 현재 단계</span>}
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}

export const ActivitySummary = ({
  label,
  name,
  children,
  actions,
}: {
  label: string
  name: string
  children: ReactNode
  actions?: ReactNode
}) => (
  <>
    <div>
      <p className={TEXT.meta}>{label}</p>
      <h2 className={`${TEXT.section} mt-2`}>{name}</h2>
    </div>
    <div className="flex flex-col gap-3">{children}</div>
    {actions && (
      <div className="flex flex-col gap-3 border-t border-neutral-150 pt-6">{actions}</div>
    )}
  </>
)

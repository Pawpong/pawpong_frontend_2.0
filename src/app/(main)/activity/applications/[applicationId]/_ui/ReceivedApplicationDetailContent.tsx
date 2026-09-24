'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { useUpdateBreederApplicationStatus } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import {
  ActivityDetailFlow,
  ActivitySummary,
  ApplicationProgress,
} from '../../../_ui/ActivityDetailFlow'
import { TEXT } from '@/shared/config'
import { ActivityDetailLayout } from '../../../_ui/ActivityDetailLayout'
import { ApplicationAnswers } from '../../../_ui/ApplicationAnswers'
import { formatDate } from '@/shared/lib/formatDate'
import { AlertMessage, Button, CtaModal } from '@/shared/ui'
import type { ApplicationStatus, ReceivedApplicationDetailDto } from '@/shared/types'
import { ApplicationChatButton } from '@/features/chat-entry'

interface StatusAction {
  label: string
  nextStatus: ApplicationStatus
  variant: 'primary' | 'outline'
  /** 되돌리기 어려운 결정이라 확인창을 거친다 (상담 완료 표시는 바로 적용) */
  confirm?: { title: string; description: string }
}

const STATUS_ACTIONS: Partial<Record<ApplicationStatus, StatusAction[]>> = {
  consultation_pending: [
    { label: '상담 완료로 표시', nextStatus: 'consultation_completed', variant: 'primary' },
    {
      label: '신청 거절',
      nextStatus: 'adoption_rejected',
      variant: 'outline',
      confirm: {
        title: '신청을 거절할까요?',
        description: '거절하면 입양자에게 진행 종료로 표시됩니다.',
      },
    },
  ],
  consultation_completed: [
    {
      label: '입양 확정',
      nextStatus: 'adoption_approved',
      variant: 'primary',
      confirm: {
        title: '입양을 확정할까요?',
        description: '확정하면 입양자가 후기를 작성할 수 있게 됩니다.',
      },
    },
    {
      label: '신청 거절',
      nextStatus: 'adoption_rejected',
      variant: 'outline',
      confirm: {
        title: '신청을 거절할까요?',
        description: '거절하면 입양자에게 진행 종료로 표시됩니다.',
      },
    },
  ],
}

/** adopterId 는 문자열이거나 populate 된 객체로 내려온다 — 채팅 상대 지정에는 순수 id 만 필요하다 */
const toCounterpartUserId = (adopterId: ReceivedApplicationDetailDto['adopterId']) =>
  typeof adopterId === 'string' ? adopterId : (adopterId?._id ?? null)

const StatusActionSection = ({
  applicationId,
  status,
}: {
  applicationId: string
  status: ApplicationStatus
}) => {
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null)
  const updateStatus = useUpdateBreederApplicationStatus()
  const actions = STATUS_ACTIONS[status]
  if (!actions) return null

  const applyStatus = (nextStatus: ApplicationStatus) => {
    updateStatus.mutate(
      { applicationId, data: { status: nextStatus } },
      { onSuccess: () => setPendingAction(null) },
    )
  }

  const errorMessage = updateStatus.isError
    ? normalizeApiError(updateStatus.error, '상태를 변경하지 못했습니다.').message
    : null

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-150 pt-8 tab:pt-10">
      <div className="flex flex-col gap-4 tab:flex-row tab:items-center tab:justify-between">
        <h2 className={TEXT.section}>신청 처리</h2>
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Button
              key={action.nextStatus}
              variant={action.variant}
              size="lg"
              className="px-4"
              disabled={updateStatus.isPending}
              onClick={() =>
                action.confirm ? setPendingAction(action) : applyStatus(action.nextStatus)
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {errorMessage && <AlertMessage status="error" size="responsive" message={errorMessage} />}

      {pendingAction?.confirm && (
        <CtaModal
          open
          onOpenChange={(open) => !open && setPendingAction(null)}
          title={pendingAction.confirm.title}
          description={pendingAction.confirm.description}
          actions={[
            {
              label: '취소',
              variant: 'outline',
              onClick: () => setPendingAction(null),
              disabled: updateStatus.isPending,
            },
            {
              label: pendingAction.label,
              variant: 'fill',
              onClick: () => applyStatus(pendingAction.nextStatus),
              disabled: updateStatus.isPending,
            },
          ]}
        />
      )}
    </div>
  )
}

const ReceivedApplicationDetailContent = ({ applicationId }: { applicationId: string }) => {
  const { data, isPending, isError, refetch } = useQuery(
    breederQueries.receivedApplicationDetail(applicationId),
  )
  const counterpartUserId = data ? toCounterpartUserId(data.adopterId) : null

  return (
    <ActivityDetailLayout
      title="신청 상세"
      backHref="/activity?tab=applications"
      isPending={isPending}
      isError={isError}
      hasData={!!data}
      onRetry={() => void refetch()}
    >
      {data && (
        <>
          <ActivityDetailFlow
            header={<ApplicationProgress status={data.status} received />}
            summary={
              <ActivitySummary
                label="신청자"
                name={data.adopterName}
                actions={
                  <>
                    {counterpartUserId && (
                      <ApplicationChatButton
                        counterpartUserId={counterpartUserId}
                        applicationId={data.applicationId}
                        label="신청자와 상담하기"
                        className="h-12 w-full"
                      />
                    )}
                    {STATUS_ACTIONS[data.status] && (
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById('application-decision')
                            ?.scrollIntoView({ behavior: 'smooth' })
                        }
                        className="flex min-h-10 items-center text-sm font-semibold text-primary-500"
                      >
                        신청 처리로 이동 ↓
                      </button>
                    )}
                  </>
                }
              >
                <p className={TEXT.body}>{data.petName || '입양 상담 신청'}</p>
                <p className={TEXT.meta}>
                  신청일 {formatDate(data.appliedAt)}
                  {data.processedAt && ` · 처리일 ${formatDate(data.processedAt)}`}
                </p>
                <p className={TEXT.sub}>
                  {data.adopterEmail}
                  {data.adopterPhone && (
                    <>
                      <br />
                      {data.adopterPhone}
                    </>
                  )}
                </p>
                {data.breederNotes && (
                  <div className="mt-6 border-l-2 border-primary-200 bg-primary-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-primary-600">내 메모</p>
                    <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-700">
                      {data.breederNotes}
                    </p>
                  </div>
                )}
              </ActivitySummary>
            }
          >
            <ApplicationAnswers
              title="받은 신청서"
              standardResponses={data.standardResponses}
              customResponses={data.customResponses}
            />
            <section id="application-decision" className="scroll-mt-24">
              <StatusActionSection applicationId={applicationId} status={data.status} />
            </section>
          </ActivityDetailFlow>
        </>
      )}
    </ActivityDetailLayout>
  )
}

export { ReceivedApplicationDetailContent }

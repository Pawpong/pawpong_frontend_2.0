'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import { useCancelApplication } from '@/features/application'
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
import { AlertMessage, Button, CtaModal, buttonVariants } from '@/shared/ui'
import type { ApplicationStatus } from '@/shared/types'
import { ApplicationChatButton } from '@/features/chat-entry'
import { getReviewTypeForStatus } from '../../../_ui/ActivityBadges'
import { ReviewComposer } from '../../../_ui/ReviewComposer'
import { PixelArrowRightIcon } from '@/shared/assets'

/** 브리더가 결과를 정하기 전까지는 입양자가 스스로 빠질 수 있다 (확정·거절은 서버가 409) */
const CANCELLABLE_STATUSES: ApplicationStatus[] = ['consultation_pending', 'consultation_completed']

const CancelApplicationAction = ({ applicationId }: { applicationId: string }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const cancel = useCancelApplication()
  const errorMessage = cancel.isError
    ? normalizeApiError(cancel.error, '신청을 취소하지 못했어요.').message
    : null

  return (
    <>
      <Button intent="ghost" size="md" onClick={() => setIsConfirmOpen(true)}>
        신청 취소하기
      </Button>
      {errorMessage && <AlertMessage status="error" size="responsive" message={errorMessage} />}
      <CtaModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="신청을 취소할까요?"
        description={'브리더에게 취소 알림이 가요.\n취소한 뒤에도 다시 신청할 수 있어요.'}
        actions={[
          {
            label: '닫기',
            intent: 'secondary',
            onClick: () => setIsConfirmOpen(false),
            disabled: cancel.isPending,
          },
          {
            label: '신청 취소',
            intent: 'danger',
            onClick: () =>
              cancel.mutate(applicationId, { onSettled: () => setIsConfirmOpen(false) }),
            disabled: cancel.isPending,
          },
        ]}
      />
    </>
  )
}

const ApplicationDetailContent = ({
  applicationId,
  backHref,
}: {
  applicationId: string
  backHref: string
}) => {
  const {
    data,
    isPending,
    isError,
    refetch,
    isFetching: isRetrying,
  } = useQuery(applicationQueries.detail(applicationId))
  const reviewType = data ? getReviewTypeForStatus(data.status) : null

  return (
    <ActivityDetailLayout
      title="신청 상세"
      backHref={backHref}
      isPending={isPending}
      isError={isError}
      hasData={!!data}
      onRetry={() => void refetch()}
      isRetrying={isRetrying}
    >
      {data && (
        <>
          <ActivityDetailFlow
            header={<ApplicationProgress status={data.status} />}
            summary={
              <ActivitySummary
                label="상담 브리더"
                name={data.breederName}
                actions={
                  <>
                    <ApplicationChatButton
                      counterpartUserId={data.breederId}
                      applicationId={data.applicationId}
                      label="브리더와 상담하기"
                      size="lg"
                      width="full"
                    />
                    {data.status === 'consultation_pending' && (
                      <Link
                        href={`/activity/applications/${data.applicationId}/edit`}
                        className={buttonVariants({ intent: 'secondary', size: 'lg' })}
                      >
                        신청서 수정
                      </Link>
                    )}
                    <Link
                      href={`/home/${data.breederId}`}
                      className={buttonVariants({
                        intent: 'ghost',
                        size: 'md',
                      })}
                    >
                      브리더 홈 보기
                      <PixelArrowRightIcon aria-hidden className="ml-1 size-3" />
                    </Link>
                    {CANCELLABLE_STATUSES.includes(data.status) && (
                      <CancelApplicationAction applicationId={data.applicationId} />
                    )}
                  </>
                }
              >
                <p className={TEXT.body}>{data.petName || '입양 상담 신청'}</p>
                <p className={TEXT.meta}>
                  신청일 {formatDate(data.appliedAt)}
                  {data.processedAt && ` · 처리일 ${formatDate(data.processedAt)}`}
                </p>

                {data.breederNotes && (
                  <div className="mt-6 border-l-2 border-primary-200 bg-primary-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-primary-600">브리더가 남긴 말</p>
                    <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-700">
                      {data.breederNotes}
                    </p>
                  </div>
                )}
              </ActivitySummary>
            }
          >
            <ApplicationAnswers
              title="보낸 신청서"
              standardResponses={data.standardResponses}
              customResponses={data.customResponses}
            />

            {data.reviewId ? (
              <section className="flex flex-col gap-4 border-t border-neutral-150 pt-8 tab:flex-row tab:items-center tab:justify-between tab:pt-10">
                <div>
                  <h2 className={TEXT.section}>작성한 후기</h2>
                  <p className="mt-1 text-sm font-medium text-neutral-700">
                    이 신청으로 작성한 후기를 확인할 수 있어요.
                  </p>
                </div>
                <Link
                  href={`/activity/reviews/${data.reviewId}`}
                  className={buttonVariants({
                    intent: 'primary',
                    size: 'lg',
                  })}
                >
                  후기 보기
                </Link>
              </section>
            ) : reviewType ? (
              <ReviewComposer
                applicationId={data.applicationId}
                breederName={data.breederName}
                reviewType={reviewType}
              />
            ) : (
              // 거절·취소된 신청에 "완료되면 쓸 수 있어요"를 띄우면 앞으로 그렇게 될 것처럼 읽힌다
              data.status === 'consultation_pending' && (
                <AlertMessage
                  status="info"
                  size="responsive"
                  message="상담이 완료되거나 입양이 확정되면 후기를 작성할 수 있어요."
                />
              )
            )}
          </ActivityDetailFlow>
        </>
      )}
    </ActivityDetailLayout>
  )
}

export { ApplicationDetailContent }

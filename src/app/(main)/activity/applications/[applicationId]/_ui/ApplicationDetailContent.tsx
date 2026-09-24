'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import {
  ActivityDetailFlow,
  ActivitySummary,
  ApplicationProgress,
} from '../../../_ui/ActivityDetailFlow'
import { TEXT } from '@/shared/config'
import { ActivityDetailLayout } from '../../../_ui/ActivityDetailLayout'
import { ApplicationAnswers } from '../../../_ui/ApplicationAnswers'
import { formatDate } from '@/shared/lib/formatDate'
import { AlertMessage, buttonVariants } from '@/shared/ui'
import { ApplicationChatButton } from '@/features/chat-entry'
import { getReviewTypeForStatus } from '../../../_ui/ActivityBadges'
import { ReviewComposer } from '../../../_ui/ReviewComposer'

const ApplicationDetailContent = ({
  applicationId,
  backHref,
}: {
  applicationId: string
  backHref: string
}) => {
  const { data, isPending, isError, refetch } = useQuery(applicationQueries.detail(applicationId))
  const reviewType = data ? getReviewTypeForStatus(data.status) : null

  return (
    <ActivityDetailLayout
      title="신청 상세"
      backHref={backHref}
      isPending={isPending}
      isError={isError}
      hasData={!!data}
      onRetry={() => void refetch()}
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
                      className="h-12 w-full"
                    />
                    {data.status === 'consultation_pending' && (
                      <Link
                        href={`/activity/applications/${data.applicationId}/edit`}
                        className={buttonVariants({ variant: 'outline', size: 'lg' })}
                      >
                        신청서 수정
                      </Link>
                    )}
                    <Link
                      href={`/home/${data.breederId}`}
                      className={buttonVariants({ variant: 'text', className: 'min-h-10' })}
                    >
                      브리더 홈 보기 →
                    </Link>
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
                    <p className="mb-1 text-xs font-semibold text-primary-600">브리더 메모</p>
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
                    variant: 'primary',
                    size: 'lg',
                    className: 'px-6',
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
              <AlertMessage
                status="info"
                size="responsive"
                message="상담이 완료되거나 입양이 확정되면 후기를 작성할 수 있어요."
              />
            )}
          </ActivityDetailFlow>
        </>
      )}
    </ActivityDetailLayout>
  )
}

export { ApplicationDetailContent }

'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import { formatDate } from '@/shared/lib/formatDate'
import {
  AlertMessage,
  AsyncState,
  Button,
  Container,
  NavigationBar,
  buttonVariants,
} from '@/shared/ui'
import type { CustomQuestionResponse, StandardResponses } from '@/shared/types'
import { ApplicationStatusBadge, getReviewTypeForStatus } from '../../../_ui/ActivityBadges'
import { ReviewComposer } from '../../../_ui/ReviewComposer'

const STANDARD_QUESTIONS: Array<{ key: keyof StandardResponses; label: string }> = [
  { key: 'selfIntroduction', label: '자기소개' },
  { key: 'familyMembers', label: '가족 구성원' },
  { key: 'allFamilyConsent', label: '가족 모두의 입양 동의' },
  { key: 'allergyTestInfo', label: '알레르기 확인' },
  { key: 'timeAwayFromHome', label: '집을 비우는 시간' },
  { key: 'livingSpaceDescription', label: '함께 지낼 공간' },
  { key: 'previousPetExperience', label: '반려동물 경험' },
  { key: 'canProvideBasicCare', label: '기본 케어 가능 여부' },
  { key: 'canAffordMedicalExpenses', label: '치료비 감당 가능 여부' },
  { key: 'preferredPetDescription', label: '원하는 아이의 특징' },
  { key: 'desiredAdoptionTiming', label: '희망 입양 시기' },
  { key: 'additionalNotes', label: '추가 문의사항' },
  { key: 'adoptionPlan', label: '입양 계획' },
]

const formatAnswer = (answer: unknown) => {
  if (typeof answer === 'boolean') return answer ? '동의해요' : '동의하지 않아요'
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer ?? '')
}

const AnswerRow = ({ label, answer }: { label: string; answer: unknown }) => {
  const value = formatAnswer(answer)
  if (!value) return null

  return (
    <div className="grid gap-1 px-4 py-3 tab:grid-cols-[12rem_1fr] tab:gap-5 tab:px-5 tab:py-4">
      <dt className="text-xs font-semibold text-neutral-500 tab:text-sm">{label}</dt>
      <dd className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-850">
        {value}
      </dd>
    </div>
  )
}

const AnswerSection = ({
  standardResponses,
  customResponses,
}: {
  standardResponses?: StandardResponses
  customResponses: CustomQuestionResponse[]
}) => {
  const standardAnswers = STANDARD_QUESTIONS.filter(
    ({ key }) => standardResponses?.[key] !== undefined && standardResponses[key] !== '',
  )
  const hasAnswers = standardAnswers.length > 0 || customResponses.length > 0

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
      <h2 className="px-4 pt-4 pb-2 font-cafe24 text-sm text-primary-600 tab:px-5 tab:text-base">
        보낸 신청서
      </h2>
      {hasAnswers ? (
        <dl className="divide-y divide-neutral-150">
          {standardAnswers.map(({ key, label }) => (
            <AnswerRow key={key} label={label} answer={standardResponses?.[key]} />
          ))}
          {customResponses.map((response) => (
            <AnswerRow
              key={response.questionId}
              label={response.questionLabel}
              answer={response.answer}
            />
          ))}
        </dl>
      ) : (
        <p className="px-4 py-6 text-sm font-medium text-neutral-500 tab:px-5">
          저장된 신청 답변이 없습니다.
        </p>
      )}
    </section>
  )
}

const ApplicationDetailContent = ({ applicationId }: { applicationId: string }) => {
  const { data, isPending, isError, refetch } = useQuery(applicationQueries.detail(applicationId))
  const reviewType = data ? getReviewTypeForStatus(data.status) : null

  return (
    <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
      <NavigationBar title="신청 상세" backHref="/activity?tab=applications" />

      <Container className="px-4 py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
          {isPending && <AsyncState status="loading" message="신청 상세를 불러오는 중입니다." />}
          {isError && !data && (
            <AsyncState
              status="error"
              message="신청 상세를 불러오지 못했습니다."
              action={
                <Button variant="fill" size="sm" className="px-4" onClick={() => void refetch()}>
                  다시 시도
                </Button>
              }
            />
          )}

          {data && (
            <>
              <section className="rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
                <div className="flex flex-col gap-4 tab:flex-row tab:items-start tab:justify-between">
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate font-cafe24 text-lg text-neutral-850 tab:text-xl">
                        {data.breederName}
                      </h1>
                      <ApplicationStatusBadge status={data.status} />
                    </div>
                    <p className="text-sm font-medium text-neutral-700">
                      {data.petName || '입양 상담 신청'}
                    </p>
                    <p className="text-xs font-medium text-neutral-500">
                      신청일 {formatDate(data.appliedAt)}
                      {data.processedAt && ` · 처리일 ${formatDate(data.processedAt)}`}
                    </p>
                  </div>
                  <Link
                    href={`/home/${data.breederId}`}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                      className: 'px-4',
                    })}
                  >
                    브리더 홈
                  </Link>
                </div>

                {data.breederNotes && (
                  <div className="mt-4 rounded-lg bg-primary-50/60 p-3">
                    <p className="mb-1 text-xs font-semibold text-primary-600">브리더 메모</p>
                    <p className="text-sm leading-[1.6] font-medium whitespace-pre-wrap text-neutral-700">
                      {data.breederNotes}
                    </p>
                  </div>
                )}
              </section>

              <AnswerSection
                standardResponses={data.standardResponses}
                customResponses={data.customResponses}
              />

              {data.reviewId ? (
                <section className="flex flex-col gap-3 rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:flex-row tab:items-center tab:justify-between tab:p-6">
                  <div>
                    <h2 className="font-cafe24 text-base text-primary-600 tab:text-lg">
                      작성한 후기
                    </h2>
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
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export { ApplicationDetailContent }

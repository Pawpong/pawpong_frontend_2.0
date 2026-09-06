'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { Container, NavigationBar } from '@/shared/ui'
import { formatDate } from '@/shared/lib/formatDate'
import { cn } from '@/shared/lib/cn'
import type { ApplicationStatus, CustomQuestionResponse, StandardResponses } from '@/shared/types'
import { ApplicationStatusBadge } from '@/app/(main)/activity/_ui/ActivityBadges'
import { AnswerSection } from '@/app/(main)/activity/applications/[applicationId]/_ui/ReceivedApplicationDetailContent'

const MOCK_STANDARD_RESPONSES: StandardResponses = {
  privacyConsent: true,
  selfIntroduction: '강아지를 5년간 키운 경험이 있고, 재택근무라 하루 종일 함께 지낼 수 있어요.',
  familyMembers: '배우자, 초등학생 자녀 1명',
  allFamilyConsent: true,
  allergyTestInfo: '가족 모두 알레르기 검사 결과 이상 없음',
  timeAwayFromHome: '평일 3~4시간',
  livingSpaceDescription: '거실과 방 2개, 산책로가 가까운 아파트 1층에 거주 중입니다.',
  previousPetExperience: '말티즈 1마리를 12년간 키운 경험이 있습니다.',
  canProvideBasicCare: true,
  canAffordMedicalExpenses: true,
  preferredPetDescription: '건강하고 사람을 잘 따르는 아이',
  desiredAdoptionTiming: '2주 이내',
  additionalNotes: '방문 상담 가능한 날짜는 주말입니다.',
}

const MOCK_CUSTOM_RESPONSES: CustomQuestionResponse[] = [
  {
    questionId: 'q1',
    questionLabel: '반려동물 보험 가입 계획이 있나요?',
    questionType: 'text',
    answer: '네, 입양 후 바로 가입할 예정입니다.',
  },
]

// 로컬 QA 전용 — 받은 신청 상세의 상태 처리 버튼을 실제 DB 데이터 없이 눌러보기 위한 목데이터 페이지.
// StatusActionSection은 실제 컴포넌트 그대로라 "입양 확정"/"신청 거절"을 누르면 실제 API가 호출된다
// (가짜 ID라 실패 응답이 뜨는 게 정상 — 그 에러 UI도 여기서 같이 확인할 수 있다).
// 상태 자체는 위 스위처로 직접 바꿔서 4가지 상태의 버튼 구성을 확인한다.
const MOCK_APPLICATION_ID = '000000000000000000000001'

const STATUSES: ApplicationStatus[] = [
  'consultation_pending',
  'consultation_completed',
  'adoption_approved',
  'adoption_rejected',
]

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  consultation_pending: '상담 대기',
  consultation_completed: '상담 완료',
  adoption_approved: '입양 확정',
  adoption_rejected: '진행 종료',
}

const ReceivedApplicationPreviewPage = () => {
  if (process.env.NODE_ENV === 'production') notFound()

  const [status, setStatus] = useState<ApplicationStatus>('consultation_pending')

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="받은 신청 상세 (QA 프리뷰)" />

      <Container className="px-4 py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
          <section className="flex flex-wrap gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
            <p className="w-full text-xs font-semibold text-neutral-700">
              목데이터 QA 페이지 — 실제 신청이 아니라 상태별 버튼 구성을 확인하는 용도입니다.
            </p>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  status === s
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-neutral-300 bg-white text-neutral-700',
                )}
              >
                {STATUS_LABEL[s]}로 보기
              </button>
            ))}
          </section>

          <section className="rounded-xl border border-neutral-150 bg-white p-4 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-cafe24 text-lg text-neutral-850 tab:text-xl">
                  김입양
                </h1>
                <ApplicationStatusBadge status={status} />
              </div>
              <p className="text-sm font-medium text-neutral-700">루이 (말티즈)</p>
              <p className="text-xs font-medium text-neutral-500">
                신청일 {formatDate('2026-08-20T00:00:00.000Z')}
                {status !== 'consultation_pending' &&
                  ` · 처리일 ${formatDate('2026-08-27T00:00:00.000Z')}`}
              </p>
              <p className="text-xs font-medium text-neutral-500">
                adopter@example.com · 010-1234-5678
              </p>
            </div>

            <AnswerSection
              applicationId={MOCK_APPLICATION_ID}
              status={status}
              standardResponses={MOCK_STANDARD_RESPONSES}
              customResponses={MOCK_CUSTOM_RESPONSES}
            />
          </section>
        </div>
      </Container>
    </div>
  )
}

export default ReceivedApplicationPreviewPage

'use client'

import { useSyncExternalStore } from 'react'
import type { FieldPath } from 'react-hook-form'
import { CloseIcon, PawIcon } from '@/shared/assets/icons'
import { Container, CtaModal, ExitConfirmModal } from '@/shared/ui'
import { isSurveySkipped } from '@/shared/lib/surveySkip'
import type { AdoptionDetailDto } from '@/shared/types'
import { ADOPTION_SURVEY_QUESTIONS } from '@/shared/config/adoptionSurvey'
import { useApplicationForm } from '../_lib/useApplicationForm'
import type { ApplicationFormValues } from '../_lib/schema'
import { PetInfoCard } from './PetInfoCard'
import {
  LabeledField,
  CountedTextareaField,
  ReadonlyInput,
  CheckboxField,
  FooterCtaBar,
  type ApplicationTextField,
} from './FormFields'

interface ApplicationFormProps {
  detail: AdoptionDetailDto
}

// [refactored] 반복되던 체크박스 3개를 배열+map으로 전환
const CONSENT_CHECKS: { name: FieldPath<ApplicationFormValues>; label: string }[] = [
  { name: 'privacyConsent', label: '개인정보 수집 및 이용에 동의합니다.' },
  {
    name: 'canProvideBasicCare',
    label: '정기 예방 접종/ 건강검진/ 훈련 등 기본 케어가 가능합니다.',
  },
  {
    name: 'canAffordMedicalExpenses',
    label: '예상치 못한 질병/ 사고 치료비를 감당할 수 있습니다.',
  },
]

// [refactored] 조사 건너뛴 입양자용 문항(선택) — title/placeholder만 다른 복붙을 배열+map으로
const SURVEY_FIELDS: { name: ApplicationTextField; title: string; placeholder: string }[] = [
  {
    name: 'selfIntroduction',
    ...ADOPTION_SURVEY_QUESTIONS.selfIntroduction,
  },
  {
    name: 'timeAwayFromHome',
    ...ADOPTION_SURVEY_QUESTIONS.timeAwayFromHome,
  },
  {
    name: 'livingSpaceDescription',
    ...ADOPTION_SURVEY_QUESTIONS.livingSpaceDescription,
  },
]

const subscribeToSurveySkip = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange)
  return () => window.removeEventListener('storage', onStoreChange)
}

const ApplicationForm = ({ detail }: ApplicationFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    isValid,
    isPending,
    showGuard,
    confirmExit,
    cancelExit,
    handleCloseClick,
    onSubmit,
    showConsultConfirm,
    confirmConsult,
    cancelConsult,
    giveUpFromConsult,
    petSummary,
  } = useApplicationForm(detail)

  // 온보딩에서 조사 양식을 건너뛴 입양자에게만 조사 항목을 노출 (localStorage → 클라이언트에서만 읽음)
  const needsSurvey = useSyncExternalStore(subscribeToSurveySkip, isSurveySkipped, () => false)

  return (
    <div>
      {/* ═══ 상단 고정 영역 — GNB(sticky top-0) 아래에 서브헤더 + 동물 정보 카드를 함께 sticky ═══ */}
      {/* top 값 = GNB 높이(모바일 48px / 탭+ ≈56px) 기준 오프셋 */}
      <div className="sticky top-12 z-40 tab:top-14">
        {/* 서브헤더 (Figma 1654-161687) — 패딩 mo: 4·16 / tab: 4·48 / pc: 8·80 */}
        <div className="flex flex-col items-center bg-white px-4 py-1 tab:px-12 pc:px-20 pc:py-2">
          <div className="flex w-full items-center">
            <button type="button" onClick={handleCloseClick} aria-label="닫기">
              <CloseIcon className="size-6 text-neutral-700" />
            </button>
            <div className="flex flex-1 items-center justify-center p-0.5">
              <p className="text-base leading-normal font-semibold text-neutral-850">입양 신청</p>
            </div>
          </div>
        </div>

        {/* 동물 정보 카드 */}
        <PetInfoCard detail={detail} />
      </div>

      {/* ═══ 안내 배너 (정보 카드 하단) — px mo16/tab48/pc16, py32 / 정보 카드와 동일하게 max-w-[57.5rem] 중앙 컬럼, 텍스트 좌측 정렬 ═══ */}
      <div className="flex flex-col items-center px-4 py-8 tab:px-12 pc:px-4">
        <p className="w-full max-w-[55rem] font-cafe24 text-sm leading-[1.5] text-neutral-850">
          입양 신청서 작성 이후,
          <br />
          담당 브리더와 채팅을 통해 더 자세한 입양 계획을 세워보세요
        </p>
      </div>

      {/* ═══ 폼 영역 (Figma 1237-41470) — 모바일: 박스 없음 / 탭+: point-50 카드(#fffff1 p40 rounded12 max-w880) ═══ */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container className="px-[1rem] pb-12">
          <div className="mx-auto max-w-[55rem]">
            {/* 폼 박스 — 섹션 간 gap 40 */}
            <div className="flex flex-col gap-10 tab:rounded-xl tab:bg-point-50 tab:p-10">
              {/* [refactored] 라벨+필드 래퍼를 LabeledField로 통일 */}
              {/* 입양하는 동물 (읽기 전용) */}
              <LabeledField title="입양하는 동물">
                <ReadonlyInput value={petSummary} />
              </LabeledField>

              {/* 입양 계획 */}
              <CountedTextareaField
                title="입양 계획을 간단히 작성해 주세요"
                placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                name="adoptionPlan"
                register={register}
                watch={watch}
              />

              {/* 입양준비 확인 체크 */}
              <LabeledField
                title="입양준비 확인을 위한 필수 항목을 체크해주세요"
                size="lg"
                gap="gap-5"
              >
                {/* [refactored] CONSENT_CHECKS 배열을 map으로 렌더 */}
                <div className="flex flex-col gap-3">
                  {CONSENT_CHECKS.map(({ name, label }) => (
                    <CheckboxField key={name} control={control} name={name} label={label} />
                  ))}
                </div>
              </LabeledField>

              {/* 가족 구성원 */}
              <CountedTextareaField
                title="함께 거주하는 가족 구성원을 입력해주세요"
                placeholder="예) 배우자 1명, 자녀 1명, 부모님 1명"
                name="familyMembers"
                register={register}
                watch={watch}
              />

              {/* 조사 건너뛴 입양자용 조사 항목 (선택) — 온보딩 SurveyStep과 동일 문항 */}
              {needsSurvey &&
                SURVEY_FIELDS.map((field) => (
                  <CountedTextareaField
                    key={field.name}
                    {...field}
                    requirement="선택"
                    register={register}
                    watch={watch}
                  />
                ))}

              {/* 모든 가족 동의 */}
              <CheckboxField
                control={control}
                name="allFamilyConsent"
                label="모든 가족 구성원이 입양에 동의했습니다."
              />
            </div>
          </div>
        </Container>

        {/* ═══ 하단 CTA 바 (Figma 1654-161691/97/03) — [refactored] FooterCtaBar로 분리 ═══ */}
        <FooterCtaBar onCancel={handleCloseClick} isValid={isValid} isPending={isPending} />
      </form>

      {/* ═══ 나가기 확인 모달 (공통 ExitConfirmModal) ═══ */}
      <ExitConfirmModal
        open={showGuard}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="입양 신청을 그만두시나요?"
      />

      {/* ═══ 입양 상담 확인 모달 (Figma 1955-262642) — 제출 버튼 → 이 모달 → "상담하기"로 실제 신청 ═══ */}
      <CtaModal
        open={showConsultConfirm}
        onOpenChange={(isOpen) => !isOpen && cancelConsult()}
        icon={<PawIcon className="size-8 text-neutral-700" />}
        title={'브리더와 더 자세한 입양 상담이\n이루어집니다.'}
        direction="row"
        actions={[
          { label: '그만두기', variant: 'outline', onClick: giveUpFromConsult },
          { label: '상담하기', variant: 'fill', onClick: confirmConsult },
        ]}
      />
    </div>
  )
}

export { ApplicationForm }

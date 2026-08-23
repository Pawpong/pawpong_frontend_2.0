'use client'

import { AlertCircleIcon, PawIcon } from '@/shared/assets'
import { AlertMessage, Container, CtaModal, ExitConfirmModal, NavigationBar } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { useApplicationForm } from '../_lib/useApplicationForm'
import {
  ADOPTION_PLAN_FIELD,
  APPLY_TITLE,
  ALL_FAMILY_CONSENT_LABEL,
  CONSENT_CHECKS,
  CONSENT_CHECKS_TITLE,
  CONSULT_CONFIRM_TITLE,
  EXIT_CONFIRM_TITLE,
  FAMILY_MEMBERS_FIELD,
  PET_FIELD_TITLE,
  SURVEY_FIELDS,
} from '../_lib/constants'
import { PetInfoCard } from './PetInfoCard'
import {
  LabeledField,
  CountedTextareaField,
  ReadonlyInput,
  CheckboxField,
  FooterCtaBar,
} from './FormFields'

interface ApplicationFormProps {
  detail: AdoptionDetailDto
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
    needsSurvey,
    toast,
  } = useApplicationForm(detail)

  return (
    <div>
      {/* ═══ 상단 고정 영역 — GNB(sticky top-0) 아래에 서브헤더 + 동물 정보 카드를 함께 sticky ═══ */}
      {/* top 값 = GNB 높이(모바일 48px / 탭+ ≈56px) 기준 오프셋 */}
      <div className="sticky top-12 z-40 tab:top-14">
        {/* [refactored] 인라인 서브헤더 JSX → 공통 NavigationBar (Figma 976:25817 close 변형) */}
        <NavigationBar title={APPLY_TITLE} icon="close" onBack={handleCloseClick} />
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
        {/* 하단 여백 48px — CTA 바가 fixed 라 바 높이(mo 80 / tab+ 64)를 더해야 실제로 48px 남는다 */}
        <Container className="px-[1rem] pb-32 tab:pb-28">
          <div className="mx-auto max-w-[55rem]">
            {/* 폼 박스 — 섹션 간 gap 40 */}
            <div className="flex flex-col gap-10 tab:rounded-xl tab:bg-point-50 tab:p-10">
              {/* 입양하는 동물 (읽기 전용) */}
              <LabeledField title={PET_FIELD_TITLE}>
                <ReadonlyInput value={petSummary} />
              </LabeledField>

              {/* 조사 건너뛴 입양자용 조사 항목 (선택) — 시안상 '입양 계획' 바로 위에 온다 */}
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

              {/* [refactored] 인라인이던 문구를 상수로 — 조사 항목과 같은 형태로 통일 */}
              <CountedTextareaField {...ADOPTION_PLAN_FIELD} register={register} watch={watch} />

              {/* 입양준비 확인 체크 */}
              <LabeledField title={CONSENT_CHECKS_TITLE} size="lg" gap="gap-5">
                <div className="flex flex-col gap-3">
                  {CONSENT_CHECKS.map(({ name, label }) => (
                    <CheckboxField key={name} control={control} name={name} label={label} />
                  ))}
                </div>
              </LabeledField>

              <CountedTextareaField {...FAMILY_MEMBERS_FIELD} register={register} watch={watch} />

              {/* 모든 가족 동의 */}
              <CheckboxField
                control={control}
                name="allFamilyConsent"
                label={ALL_FAMILY_CONSENT_LABEL}
              />
            </div>
          </div>
        </Container>

        {/* ═══ 하단 CTA 바 (Figma 1654-161691/97/03) ═══ */}
        <FooterCtaBar onCancel={handleCloseClick} isValid={isValid} isPending={isPending}>
          {/* 신청 실패 토스트 — 위치(바 높이 기준)는 FooterCtaBar가 잡는다 */}
          {toast.current && (
            <AlertMessage
              status="error"
              size="responsive"
              icon={AlertCircleIcon}
              message={toast.current.message}
              onClose={toast.hide}
            />
          )}
        </FooterCtaBar>
      </form>

      {/* ═══ 나가기 확인 모달 (공통 ExitConfirmModal) ═══ */}
      <ExitConfirmModal
        open={showGuard}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title={EXIT_CONFIRM_TITLE}
      />

      {/* ═══ 입양 상담 확인 모달 (Figma 1955-262642) — 제출 버튼 → 이 모달 → "상담하기"로 실제 신청 ═══ */}
      <CtaModal
        open={showConsultConfirm}
        onOpenChange={(isOpen) => !isOpen && cancelConsult()}
        icon={<PawIcon className="size-8 text-neutral-700" />}
        title={CONSULT_CONFIRM_TITLE}
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

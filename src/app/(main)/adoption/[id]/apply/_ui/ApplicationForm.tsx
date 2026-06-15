'use client'

import type { FieldPath } from 'react-hook-form'
import { CloseIcon } from '@/shared/assets/icons'
import { Container, CtaModal, TextareaField } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { useApplicationForm } from '../_lib/useApplicationForm'
import type { ApplicationFormValues } from '../_lib/schema'
import { PetInfoCard } from './PetInfoCard'
import { LabeledField, ReadonlyInput, CheckboxField, FooterCtaBar } from './FormFields'

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

// [refactored] textarea 글자 수 제한 매직넘버(100) 상수화
const TEXTAREA_MAX_LENGTH = 100

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
    petSummary,
  } = useApplicationForm(detail)

  return (
    <div className="pb-[5.5rem] tab:pb-20">
      {/* ═══ 상단 고정 영역 — GNB(sticky top-0) 아래에 서브헤더 + 동물 정보 카드를 함께 sticky ═══ */}
      {/* top 값 = GNB 높이(모바일 48px / 탭+ ≈56px) 기준 오프셋 */}
      <div className="sticky top-12 z-40 tab:top-14">
        {/* 서브헤더 (Figma 1654-161687) — 패딩 mo: 4·16 / tab: 4·48 / pc: 8·80 */}
        <div className="flex flex-col items-center bg-white px-4 py-1 tab:px-12 pc:px-20 pc:py-2">
          <div className="flex w-full items-center">
            <button type="button" onClick={handleCloseClick} aria-label="닫기">
              <CloseIcon className="size-6 text-[#6b6b6b]" />
            </button>
            <div className="flex flex-1 items-center justify-center p-0.5">
              <p className="text-base leading-normal font-semibold text-[#3e3e3e]">입양 신청</p>
            </div>
          </div>
        </div>

        {/* 동물 정보 카드 */}
        <PetInfoCard detail={detail} />
      </div>

      {/* ═══ 안내 배너 (정보 카드 하단) — px mo16/tab48/pc16, py32 / 정보 카드와 동일하게 max-w-[57.5rem] 중앙 컬럼, 텍스트 좌측 정렬 ═══ */}
      <div className="flex flex-col items-center px-4 py-8 tab:px-12 pc:px-4">
        <p className="w-full max-w-[57.5rem] font-cafe24 text-sm leading-[1.5] text-[#3e3e3e]">
          입양 신청서 작성 이후,
          <br />
          담당 브리더와 채팅을 통해 더 자세한 입양 계획을 세워보세요
        </p>
      </div>

      {/* ═══ 폼 영역 (Figma 1237-41470) — 모바일: 박스 없음 / 탭+: 회색 카드(#f6f6f6 p40 rounded12 max-w880) ═══ */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container className="px-[1rem] pb-12">
          <div className="pc:mx-auto pc:max-w-[55rem]">
            {/* 폼 박스 — 섹션 간 gap 40 */}
            <div className="flex flex-col gap-10 tab:rounded-xl tab:bg-[#f6f6f6] tab:p-10">
              {/* [refactored] 라벨+필드 래퍼를 LabeledField로 통일 */}
              {/* 입양하는 동물 (읽기 전용) */}
              <LabeledField title="입양하는 동물">
                <ReadonlyInput value={petSummary} />
              </LabeledField>

              {/* 입양 계획 */}
              <LabeledField title="입양 계획을 간단히 작성해 주세요">
                <TextareaField
                  placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                  maxLength={TEXTAREA_MAX_LENGTH}
                  currentLength={watch('adoptionPlan')?.length ?? 0}
                  {...register('adoptionPlan')}
                />
              </LabeledField>

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
              <LabeledField title="함께 거주하는 가족 구성원을 입력해주세요">
                <TextareaField
                  placeholder="예) 배우자 1명, 자녀 1명, 부모님 1명"
                  maxLength={TEXTAREA_MAX_LENGTH}
                  currentLength={watch('familyMembers')?.length ?? 0}
                  {...register('familyMembers')}
                />
              </LabeledField>

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

      {/* ═══ 나가기 확인 모달 ═══ */}
      <CtaModal
        open={showGuard}
        onOpenChange={(isOpen) => !isOpen && cancelExit()}
        icon={null}
        title="입양 신청을 그만두시나요?"
        direction="responsive"
        actions={[
          { label: '닫기', variant: 'outline', onClick: cancelExit },
          { label: '그만두기', variant: 'fill', onClick: confirmExit },
        ]}
      />
    </div>
  )
}

export { ApplicationForm }

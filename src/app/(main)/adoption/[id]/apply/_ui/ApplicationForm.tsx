'use client'

import { CloseIcon } from '@/shared/assets/icons'
import { Container, CtaModal } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { cn } from '@/shared/lib/cn'
import { useApplicationForm } from '../_lib/useApplicationForm'
import { PetInfoCard } from './PetInfoCard'
import { FormSection, ReadonlyInput, CheckboxField } from './FormFields'

interface ApplicationFormProps {
  detail: AdoptionDetailDto
}

const ApplicationForm = ({ detail }: ApplicationFormProps) => {
  const {
    register,
    control,
    handleSubmit,
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
    <div className="pb-[5.5rem] tab:pb-0">
      {/* ═══ 서브헤더 (Figma 1654-161687) — 패딩 mo: 4·16 / tab: 4·48 / pc: 8·80 ═══ */}
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

      {/* ═══ 동물 정보 카드 ═══ */}
      <PetInfoCard detail={detail} />

      {/* ═══ 안내 배너 (정보 카드 하단) — px mo16/tab48/pc16, py32 / 정보 카드와 동일하게 max-w-[57.5rem] 중앙 컬럼, 텍스트 좌측 정렬 ═══ */}
      <div className="flex flex-col items-center px-4 py-8 tab:px-12 pc:px-4">
        <p className="w-full max-w-[57.5rem] font-cafe24 text-sm leading-[1.5] text-[#3e3e3e]">
          입양 신청서 작성 이후,
          <br />
          담당 브리더와 채팅을 통해 더 자세한 입양 계획을 세워보세요
        </p>
      </div>

      {/* ═══ 폼 영역 ═══ */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 회색 배경 컨테이너 — 상세 페이지 Section과 동일: 상위 Container에 12px 48px 패딩 + pc 중앙 컬럼 */}
        <Container className="px-[1rem] py-[0.75rem] pc:py-[1.25rem]">
          <div className="mt-[1.996rem] rounded-[1rem] bg-[#f5f5f5] p-[0.75rem] tab:mt-[2.5rem] tab:mb-[3rem] tab:px-[2.625rem] tab:pt-[2.5rem] tab:pb-[2.5rem] pc:mx-auto pc:max-w-[57.5rem]">
            {/* 흰색 폼 카드 */}
            <div className="rounded-[1rem] bg-white px-[0.75rem] py-[1rem] tab:px-[4.25rem] tab:py-[2.125rem]">
              <div className="flex flex-col gap-[0.75rem] tab:gap-[2rem]">
                <FormSection title="마음에 두신 아이가 있나요?">
                  <ReadonlyInput value={petSummary} />
                </FormSection>

                <FormSection title="입양 계획을 간단히 작성해 주세요">
                  <textarea
                    {...register('adoptionPlan')}
                    placeholder="생활패턴, 주거환경, 입양 시기 등을 입력해주세요"
                    className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
                  />
                </FormSection>

                <FormSection title="입양준비 확인을 위한 필수 항목을 체크해볼게요">
                  <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
                    <CheckboxField
                      control={control}
                      name="privacyConsent"
                      label="개인정보 수집 및 이용에 동의합니다"
                    />
                    <CheckboxField
                      control={control}
                      name="canProvideBasicCare"
                      label="정기 예방접종/ 검강검진/ 훈련 등 기본 케어가 가능합니다."
                    />
                    <CheckboxField
                      control={control}
                      name="canAffordMedicalExpenses"
                      label="예상치 못한 질병/ 사고 치료비를 감당할 수 있습니다."
                    />
                  </div>
                </FormSection>

                <FormSection title="함께 거주하는 가족 구성원을 입력해주세요">
                  <textarea
                    {...register('familyMembers')}
                    placeholder="예: 배우자 1명,  자녀 1명, 부모님 1명"
                    className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
                  />
                  <CheckboxField
                    control={control}
                    name="allFamilyConsent"
                    label="모든 가족 구성원이 입양에 동의했습니다."
                  />
                </FormSection>
              </div>
            </div>

            {/* 데스크탑 CTA */}
            <div className="hidden tab:mt-[1.5rem] tab:flex tab:justify-end">
              <button
                type="submit"
                disabled={!isValid || isPending}
                className={cn(
                  'flex h-10 w-[10rem] items-center justify-center rounded-full text-[0.875rem] font-medium transition-colors',
                  isValid && !isPending ? 'bg-[#5d5d5d] text-white' : 'bg-[#d4d4d4] text-[#5d5d5d]',
                )}
              >
                {isPending ? '제출 중...' : '상담 신청하기'}
              </button>
            </div>
          </div>
        </Container>

        {/* 모바일 CTA (하단 고정) */}
        <div className="fixed right-0 bottom-0 left-0 z-10 bg-white p-[1.25rem] tab:hidden">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full text-[1rem] font-semibold transition-colors',
              isValid && !isPending ? 'bg-[#5d5d5d] text-white' : 'bg-[#d4d4d4] text-[#5d5d5d]',
            )}
          >
            {isPending ? '제출 중...' : '상담 신청하기'}
          </button>
        </div>
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

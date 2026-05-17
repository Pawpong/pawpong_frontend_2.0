'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CloseIcon } from '@/shared/assets/icons'
import { ExitConfirmDialog } from '@/shared/ui'
import { useCreateApplication } from '@/features/application/model/hooks'
import { useFormGuard } from '@/shared/lib/useFormGuard'
import { useBrowserNavigationGuard } from '@/shared/lib/useBrowserNavigationGuard'
import type { AdoptionDetailDto } from '@/shared/types'
import { GENDER_LABEL } from '@/shared/types'
import { cn } from '@/shared/lib/Cn'
import { applicationSchema, getAgeText, type ApplicationFormValues } from '../_lib/schema'
import { BreederProfile } from './BreederProfile'
import { PetInfoCard } from './PetInfoCard'
import { FormSection, ReadonlyInput, CheckboxField } from './FormFields'

interface ApplicationFormProps {
  detail: AdoptionDetailDto
}

const ApplicationForm = ({ detail }: ApplicationFormProps) => {
  const router = useRouter()
  const { mutate: createApplication, isPending } = useCreateApplication()

  const {
    register,
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    mode: 'onChange',
    defaultValues: {
      adoptionPlan: '',
      privacyConsent: false,
      canProvideBasicCare: false,
      canAffordMedicalExpenses: false,
      familyMembers: '',
      allFamilyConsent: false,
    },
  })

  /* ── 네비게이션 가드 ── */
  const {
    showNavigationDialog,
    handleNavigationConfirm,
    handleNavigationCancel,
  } = useFormGuard({ hasChanges: isDirty })

  const {
    showBrowserGuard,
    handleBrowserConfirm,
    handleBrowserCancel,
  } = useBrowserNavigationGuard({ hasChanges: isDirty, enabled: true })

  const handleCloseClick = () => {
    if (isDirty) {
      handleBrowserCancel()
      // X 버튼은 브라우저 가드와 동일한 모달을 재사용하되,
      // 직접 history.back()을 트리거해야 하므로 popstate를 발생시킴
      window.history.back()
    } else {
      router.back()
    }
  }

  const onSubmit = (data: ApplicationFormValues) => {
    createApplication(
      {
        breederId: detail.breeder.id,
        petId: detail.listingId,
        privacyConsent: data.privacyConsent,
        selfIntroduction: data.adoptionPlan,
        familyMembers: data.familyMembers,
        allFamilyConsent: data.allFamilyConsent,
        canProvideBasicCare: data.canProvideBasicCare,
        canAffordMedicalExpenses: data.canAffordMedicalExpenses,
        allergyTestInfo: '',
        timeAwayFromHome: '',
        livingSpaceDescription: '',
        previousPetExperience: '',
      },
      {
        onSuccess: () => {
          router.push(`/adoption/${detail.listingId}`)
        },
      },
    )
  }

  const petSummary = `${detail.name} . ${GENDER_LABEL[detail.gender]} . ${getAgeText(detail.birthDate)}`

  return (
    <div className="pb-[5.5rem] tab:pb-0">
      {/* ═══ 서브헤더 ═══ */}
      <div className="flex items-center gap-[0.625rem] px-[1.25rem] py-[0.75rem] tab:h-[5.5rem] tab:justify-center tab:px-[6.25rem] tab:py-[0.625rem]">
        <button type="button" onClick={handleCloseClick} className="tab:absolute tab:left-[6.25rem]">
          <CloseIcon className="size-[1.25rem] text-[#5d5d5d] tab:size-[1.5rem]" />
        </button>
        <p className="text-[0.875rem] font-semibold leading-[1.5] text-[#5d5d5d] tab:text-[1.25rem]">
          <span className="tab:hidden">입양 신청 | {detail.name}</span>
          <span className="hidden tab:inline">입양 신청</span>
        </p>
      </div>

      {/* ═══ 브리더 프로필 (데스크탑) ═══ */}
      <BreederProfile breeder={detail.breeder} />

      {/* ═══ 동물 정보 카드 (데스크탑) ═══ */}
      <PetInfoCard detail={detail} />

      {/* ═══ 폼 영역 ═══ */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 모바일 안내 문구 */}
        <div className="px-[1.25rem] pb-[0.25rem] pt-[0.75rem] tab:hidden">
          <p className="text-[0.75rem] font-semibold leading-[1.5] text-[#5d5d5d]">
            입양 신청서 작성 이후,
            <br />
            담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
          </p>
        </div>

        {/* 회색 배경 컨테이너 */}
        <div className="mx-[1.25rem] mt-[1.996rem] rounded-[1rem] bg-[#f5f5f5] p-[0.75rem] tab:mx-[6.25rem] tab:mb-[3rem] tab:mt-[2.5rem] tab:px-[2.625rem] tab:pb-[2.5rem] tab:pt-[2.5rem]">
          {/* 데스크탑 안내 문구 */}
          <div className="hidden tab:mb-[4.379rem] tab:block">
            <p className="text-[1rem] font-semibold leading-[1.5] text-[#5d5d5d]">
              입양 신청서 작성 이후,
              <br />
              담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
            </p>
          </div>

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
                  className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
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
                  className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] placeholder:text-[#a8a8a8] focus:border-[#5d5d5d] focus:outline-none tab:h-[6.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
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
                isValid && !isPending
                  ? 'bg-[#5d5d5d] text-white'
                  : 'bg-[#d4d4d4] text-[#5d5d5d]',
              )}
            >
              {isPending ? '제출 중...' : '상담 신청하기'}
            </button>
          </div>
        </div>

        {/* 모바일 CTA (하단 고정) */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-white p-[1.25rem] tab:hidden">
          <button
            type="submit"
            disabled={!isValid || isPending}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-full text-[1rem] font-semibold transition-colors',
              isValid && !isPending
                ? 'bg-[#5d5d5d] text-white'
                : 'bg-[#d4d4d4] text-[#5d5d5d]',
            )}
          >
            {isPending ? '제출 중...' : '상담 신청하기'}
          </button>
        </div>
      </form>

      {/* ═══ 나가기 확인 모달 ═══ */}
      <ExitConfirmDialog
        open={showBrowserGuard || showNavigationDialog}
        onConfirm={showBrowserGuard ? handleBrowserConfirm : handleNavigationConfirm}
        onCancel={showBrowserGuard ? handleBrowserCancel : handleNavigationCancel}
      />
    </div>
  )
}

export { ApplicationForm }

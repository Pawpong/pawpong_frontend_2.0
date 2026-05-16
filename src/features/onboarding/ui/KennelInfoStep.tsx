'use client'

import { useForm, Controller } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon } from '@/shared/assets/icons'
import { useOnboarding } from '../model/OnboardingContext'
import { type KennelInfoFormData, REGIONS } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepInput, StepActionButton, StepSelect } from './StepInput'
import { StepNavButtons } from './StepNavButtons'
import { ChipSelect } from './ChipSelect'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }))

const BREED_KEYWORDS = [
  '비숑', '도베르만', '골든리트리버', '푸들', '시바이누', '말티즈',
  '포메라니안', '코기', '허스키', '사모예드', '래브라도',
]

const KennelInfoStep = () => {
  const { goNext, goBack, formData, setFormData } = useOnboarding()

  const { register, control, handleSubmit } = useForm<KennelInfoFormData>({
    // resolver: zodResolver(kennelInfoSchema),
    defaultValues: (formData['kennel-info'] as KennelInfoFormData) ?? {
      breederName: '',
      region: undefined,
      selectedBreeds: [],
    },
  })

  const onSubmit = (data: KennelInfoFormData) => {
    setFormData('kennel-info', data as unknown as Record<string, unknown>)
    goNext()
  }

  return (
    <StepLayout>
      <StepTitle>브리더 정보를 입력해주세요</StepTitle>

      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

      {/* 프로필 이미지 */}
      <div className="mt-[2.09rem] tab:mt-[6.343rem]">
        <button
          type="button"
          className="flex h-[8.9375rem] w-[9.1875rem] items-center justify-center rounded-full bg-[#d4d4d4]"
        >
          <ImageIcon className="size-[3.5rem] text-white" />
        </button>
      </div>

      {/* 폼 영역 */}
      <div className="mt-[2.04rem] flex w-full flex-col gap-[0.625rem] px-[1.25rem] tab:mt-[3.0625rem] tab:w-[59.4375rem] tab:gap-0 tab:px-0">
        {/* 브리더명 + 중복검사 */}
        <div className="flex gap-[0.25rem] tab:gap-[1.1875rem]">
          <StepInput
            type="text"
            placeholder="브리더명(상호명)"
            {...register('breederName')}
            className="flex-1 tab:flex-[731]"
          />
          <StepActionButton>중복검사</StepActionButton>
        </div>

        {/* 지역 */}
        <div className="tab:mt-[2.09rem]">
          <Controller
            name="region"
            control={control}
            render={({ field }) => (
              <StepSelect
                value={field.value ?? ''}
                onValueChange={field.onChange}
                placeholder="지역"
                options={REGION_OPTIONS}
              />
            )}
          />
        </div>

        {/* 품종 키워드 */}
        <div className="tab:mt-[2.09rem]">
          <Controller
            name="selectedBreeds"
            control={control}
            render={({ field }) => (
              <ChipSelect
                label={
                  <>
                    <span className="hidden tab:inline">품종</span>
                    <span className="tab:hidden">관심있는 키워드</span>
                  </>
                }
                items={BREED_KEYWORDS}
                selected={field.value}
                onToggle={(breed) => {
                  const next = field.value.includes(breed)
                    ? field.value.filter((b) => b !== breed)
                    : [...field.value, breed]
                  field.onChange(next)
                }}
              />
            )}
          />
        </div>
      </div>

      <StepNavButtons onNext={() => handleSubmit(onSubmit)()} onBack={goBack} className="tab:mt-[9.9375rem]" />
    </StepLayout>
  )
}

export { KennelInfoStep }

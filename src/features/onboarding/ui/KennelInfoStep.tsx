'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type KennelInfoFormData, REGIONS } from '../model/schema'
import { StepContainer } from './StepContainer'
import { StepInput, StepActionButton, StepSelect } from './StepInput'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'

const REGION_OPTIONS = REGIONS.map((r) => ({ value: r, label: r }))

const BREED_KEYWORDS = [
  '비숑',
  '도베르만',
  '골든리트리버',
  '푸들',
  '시바이누',
  '말티즈',
  '포메라니안',
  '코기',
  '허스키',
  '사모예드',
  '래브라도',
]

const KennelInfoStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, onSubmit } =
    useStepForm<KennelInfoFormData>('kennel-info', {
      breederName: '',
      region: undefined,
      selectedBreeds: [],
    })

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      navClassName="tab:mt-[9.9375rem]"
    >
      <ProfileImageUpload />

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
    </StepContainer>
  )
}

export { KennelInfoStep }

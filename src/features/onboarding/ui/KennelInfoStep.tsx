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
    >
      <div className="mt-[2rem] flex w-full flex-col items-center gap-[2rem] px-5 tab:mt-[3.625rem] tab:max-w-[40.625rem] tab:gap-[3.625rem] tab:px-0">
        <ProfileImageUpload />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-[0.625rem] tab:gap-[2.09rem]">
          {/* 브리더명 + 중복검사 */}
          <div className="flex gap-2">
            <StepInput
              type="text"
              placeholder="브리더명(상호명)"
              {...register('breederName')}
              className="flex-1"
            />
            <StepActionButton>중복검사</StepActionButton>
          </div>

          {/* 지역 */}
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

          {/* 품종 키워드 */}
          <div className="flex flex-col">
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
      </div>
    </StepContainer>
  )
}

export { KennelInfoStep }

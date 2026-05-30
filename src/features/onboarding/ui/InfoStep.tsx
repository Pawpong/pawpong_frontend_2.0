'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type InfoFormData } from '../model/schema'
import { StepContainer } from './StepContainer'
import { StepInput, StepActionButton } from './StepInput'
import { ChipSelect } from './ChipSelect'
import { ProfileImageUpload } from './ProfileImageUpload'

const SAMPLE_KEYWORDS = [
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
  '치와와',
  '닥스훈트',
  '보더콜리',
  '슈나우저',
  '비글',
  '요크셔테리어',
  '웰시코기',
  '진돗개',
  '삽살개',
  '풍산개',
]

const InfoStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, onSubmit } =
    useStepForm<InfoFormData>('info', {
      nickname: '',
      selectedKeywords: [],
    })

  return (
    <StepContainer
      title="회원 정보를 입력해주세요"
      onNext={() => handleSubmit(onSubmit)()}
      onBack={goBack}
      navClassName="tab:mt-[9.9375rem]"
    >
      <ProfileImageUpload />

      {/* 폼 영역 */}
      <div className="mt-[2.04rem] flex w-full flex-col px-[1.25rem] tab:mt-[3.0625rem] tab:w-[59.4375rem] tab:px-0">
        {/* 닉네임 + 중복검사 */}
        <div className="flex gap-[0.25rem] tab:gap-[1.1875rem]">
          <StepInput
            type="text"
            placeholder="닉네임"
            {...register('nickname')}
            className="flex-1 tab:flex-[731]"
          />
          <StepActionButton>중복 검사</StepActionButton>
        </div>

        {/* 관심있는 키워드 */}
        <div className="mt-[0.625rem] tab:mt-[2.09rem]">
          <Controller
            name="selectedKeywords"
            control={control}
            render={({ field }) => (
              <ChipSelect
                label="관심있는 키워드"
                items={SAMPLE_KEYWORDS}
                selected={field.value}
                onToggle={(keyword) => {
                  const next = field.value.includes(keyword)
                    ? field.value.filter((k) => k !== keyword)
                    : [...field.value, keyword]
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

export { InfoStep }

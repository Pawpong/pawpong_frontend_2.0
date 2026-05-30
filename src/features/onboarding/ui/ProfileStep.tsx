'use client'

import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { type ProfileFormData, EMAIL_DOMAINS } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepFieldLabel, StepInput, StepActionButton, StepSelect } from './StepInput'
import { StepNavButtons } from './StepNavButtons'
import { CheckboxField } from './CheckboxField'

const AGREEMENTS = [
  {
    id: 'serviceAgreed' as const,
    label: '(필수) 서비스 이용약관 동의',
    hasDetail: true,
  },
  {
    id: 'privacyAgreed' as const,
    label: '개인정보 수집 및 이용 동의',
    hasDetail: true,
  },
  {
    id: 'marketingAgreed' as const,
    label: '(선택) 마케팅 수신 동의',
    hasDetail: false,
  },
]

const ProfileStep = () => {
  const { goBack } = useOnboarding()

  const { register, control, handleSubmit, watch, setValue, onSubmit } =
    useStepForm<ProfileFormData>('profile', {
      email: '',
      emailDomain: EMAIL_DOMAINS[0],
      phone: '',
      verificationCode: '',
      serviceAgreed: false as unknown as true,
      privacyAgreed: false as unknown as true,
      marketingAgreed: false,
      isOver14: false as unknown as true,
    })

  const serviceAgreed = watch('serviceAgreed')
  const privacyAgreed = watch('privacyAgreed')
  const marketingAgreed = watch('marketingAgreed')
  const isOver14 = watch('isOver14')

  const allAgreementsChecked = serviceAgreed && privacyAgreed && marketingAgreed && isOver14

  const handleToggleAll = () => {
    const nextValue = !allAgreementsChecked
    setValue('serviceAgreed', nextValue as unknown as true)
    setValue('privacyAgreed', nextValue as unknown as true)
    setValue('marketingAgreed', nextValue)
    setValue('isOver14', nextValue as unknown as true)
  }

  return (
    <StepLayout>
      <StepTitle subtitle="문자 미수신 시 [인증번호 재전송] 버튼을 눌러주세요">
        계정 정보를 입력해주세요
      </StepTitle>

      <div className="flex w-full max-w-[40.625rem] flex-col items-center gap-8 px-4 py-12 tab:gap-[3.625rem] tab:px-20 tab:py-12">
        <StepIndicator />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-4">
          <div>
            <StepFieldLabel label="이메일" required />
            <div className="flex items-end gap-1">
              <StepInput
                type="text"
                placeholder="이메일을 입력해주세요"
                {...register('email')}
                className="flex-1"
              />
              <Controller
                name="emailDomain"
                control={control}
                render={({ field }) => (
                  <StepSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={EMAIL_DOMAINS.map((d) => ({ value: d, label: d }))}
                    className="w-[7.6875rem]"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <StepFieldLabel label="휴대폰 번호" required />
            <div className="flex items-end gap-2">
              <StepInput
                type="tel"
                placeholder="휴대폰 번호를 입력해주세요"
                {...register('phone')}
                className="flex-1"
              />
              <StepActionButton>인증번호</StepActionButton>
            </div>
          </div>

          <div>
            <StepFieldLabel label="인증번호" required />
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <StepInput
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  {...register('verificationCode')}
                  className="pr-[3.5rem]"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[0.875rem] font-medium text-[#3e3e3e]">
                  3:00
                </span>
              </div>
              <StepActionButton>확인</StepActionButton>
            </div>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="flex w-full flex-col gap-10">
          <div className="flex flex-col gap-4">
            <CheckboxField
              label="전체 약관동의"
              checked={!!allAgreementsChecked}
              onCheckedChange={handleToggleAll}
            />

            {AGREEMENTS.map((agreement) => (
              <Controller
                key={agreement.id}
                name={agreement.id}
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    label={agreement.label}
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    hasDetailLink={agreement.hasDetail}
                  />
                )}
              />
            ))}
          </div>

          <Controller
            name="isOver14"
            control={control}
            render={({ field }) => (
              <CheckboxField
                label="본인은 만 14세 이상입니다."
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
              />
            )}
          />
        </div>
      </div>

      <StepNavButtons
        onNext={() => handleSubmit(onSubmit)()}
        onBack={goBack}
      />
    </StepLayout>
  )
}

export { ProfileStep }

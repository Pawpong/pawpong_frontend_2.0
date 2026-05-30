'use client'

import { useForm, Controller } from 'react-hook-form'
import { Checkbox, DetailLink } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'
import { type ProfileFormData, EMAIL_DOMAINS } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepFieldLabel, StepInput, StepActionButton, StepSelect } from './StepInput'
import { StepNavButtons } from './StepNavButtons'

const AGREEMENTS = [
  {
    id: 'serviceAgreed' as const,
    label: '(필수) 서비스 이용약관 동의',
    required: true,
    hasDetail: true,
  },
  {
    id: 'privacyAgreed' as const,
    label: '개인정보 수집 및 이용 동의',
    required: true,
    hasDetail: true,
  },
  {
    id: 'marketingAgreed' as const,
    label: '(선택) 마케팅 수신 동의',
    required: false,
    hasDetail: false,
  },
]

const CHECKBOX_CLASS =
  'size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]'

const ProfileStep = () => {
  const { goNext, goBack, formData, setFormData } = useOnboarding()

  const { register, control, handleSubmit, watch, setValue } = useForm<ProfileFormData>({
    defaultValues: (formData.profile as ProfileFormData) ?? {
      email: '',
      emailDomain: EMAIL_DOMAINS[0],
      phone: '',
      verificationCode: '',
      serviceAgreed: false as unknown as true,
      privacyAgreed: false as unknown as true,
      marketingAgreed: false,
      isOver14: false as unknown as true,
    },
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

  const onSubmit = (data: ProfileFormData) => {
    setFormData('profile', data as unknown as Record<string, unknown>)
    goNext()
  }

  return (
    <StepLayout className="tab:px-20 tab:py-12">
      <StepTitle subtitle="문자 미수신 시 [인증번호 재전송] 버튼을 눌러주세요">
        계정 정보를 입력해주세요
      </StepTitle>

      <div className="flex w-full max-w-[40.625rem] flex-col items-center gap-[3.625rem] px-5 tab:px-0">
        <StepIndicator />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-4">
          {/* 이메일 */}
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

          {/* 휴대폰 번호 */}
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

          {/* 인증번호 */}
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
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={!!allAgreementsChecked}
                onCheckedChange={handleToggleAll}
                className={CHECKBOX_CLASS}
              />
              <span className="text-base font-medium leading-[1.5] text-[#3e3e3e]">
                전체 약관동의
              </span>
            </label>

            {AGREEMENTS.map((agreement) => (
              <Controller
                key={agreement.id}
                name={agreement.id}
                control={control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      className={CHECKBOX_CLASS}
                    />
                    <span className="flex-1 text-base font-medium leading-[1.5] text-[#3e3e3e]">
                      {agreement.label}
                    </span>
                    {agreement.hasDetail && <DetailLink variant="button" size="lg" />}
                  </label>
                )}
              />
            ))}
          </div>

          {/* 만 14세 확인 */}
          <Controller
            name="isOver14"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  className={CHECKBOX_CLASS}
                />
                <span className="text-base font-medium leading-[1.5] text-[#3e3e3e]">
                  본인은 만 14세 이상입니다.
                </span>
              </label>
            )}
          />
        </div>
      </div>

      <StepNavButtons
        onNext={() => handleSubmit(onSubmit)()}
        onBack={goBack}
        className="mt-12"
      />
    </StepLayout>
  )
}

export { ProfileStep }

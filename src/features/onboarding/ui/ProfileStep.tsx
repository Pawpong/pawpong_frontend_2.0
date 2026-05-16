'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { Checkbox } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'
import { profileSchema, type ProfileFormData, EMAIL_DOMAINS } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepInput, StepActionButton, StepSelect } from './StepInput'
import { StepNavButtons } from './StepNavButtons'

const AGREEMENTS = [
  { id: 'serviceAgreed' as const, label: '(필수) 서비스 이용약관 동의', required: true, hasDetail: true },
  { id: 'privacyAgreed' as const, label: '개인정보 수집 및 이용 동의', required: true, hasDetail: true },
  { id: 'marketingAgreed' as const, label: '(선택) 마케팅 수신 동의', required: false, hasDetail: false },
]

const CHECKBOX_CLASS =
  'size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]'

const ProfileStep = () => {
  const { goNext, goBack, formData, setFormData } = useOnboarding()

  const { register, control, handleSubmit, watch, setValue, getValues } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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
    setValue('serviceAgreed', nextValue as unknown as true, { shouldValidate: true })
    setValue('privacyAgreed', nextValue as unknown as true, { shouldValidate: true })
    setValue('marketingAgreed', nextValue, { shouldValidate: true })
    setValue('isOver14', nextValue as unknown as true, { shouldValidate: true })
  }

  const onSubmit = (data: ProfileFormData) => {
    setFormData('profile', data as unknown as Record<string, unknown>)
    goNext()
  }

  return (
    <StepLayout>
      <StepTitle>계정 정보를 입력해주세요</StepTitle>

      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

      {/* 폼 영역 */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-[2.625rem] flex w-full flex-col px-[1.25rem] tab:mt-[7.1875rem] tab:w-[59.4375rem] tab:px-0"
      >
        {/* 이메일 */}
        <div className="flex gap-[0.25rem] tab:gap-[1.25rem]">
          <StepInput
            type="text"
            placeholder="이메일"
            {...register('email')}
            className="flex-1 tab:flex-[731]"
          />
          <Controller
            name="emailDomain"
            control={control}
            render={({ field }) => (
              <StepSelect
                value={field.value}
                onValueChange={field.onChange}
                options={EMAIL_DOMAINS.map((d) => ({ value: d, label: d }))}
                className="shrink-0 tab:w-[12.5rem]"
              />
            )}
          />
        </div>

        {/* 휴대폰 번호 */}
        <div className="mt-[0.625rem] flex gap-[0.25rem] tab:mt-[1.6875rem] tab:gap-[1.1875rem]">
          <StepInput
            type="tel"
            placeholder="휴대폰번호"
            {...register('phone')}
            className="flex-1 tab:flex-[731]"
          />
          <StepActionButton>인증번호 받기</StepActionButton>
        </div>

        {/* 인증번호 */}
        <div className="mt-[0.625rem] flex gap-[0.25rem] tab:mt-[1.6875rem] tab:gap-[1.1875rem]">
          <div className="relative flex-1 tab:flex-[731]">
            <StepInput
              type="text"
              placeholder="인증번호"
              {...register('verificationCode')}
              className="pr-[3rem]"
            />
            <span className="absolute top-1/2 right-[0.625rem] -translate-y-1/2 text-[0.75rem] leading-[1.375rem] text-[#5d5d5d] tab:right-[1.25rem] tab:text-[1rem]">
              03:00
            </span>
          </div>
          <StepActionButton>확인</StepActionButton>
        </div>

        {/* 약관 동의 */}
        <div className="mt-[2.5625rem] flex flex-col tab:mt-[1.688rem]">
          <label className="flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]">
            <Checkbox
              checked={!!allAgreementsChecked}
              onCheckedChange={handleToggleAll}
              className={CHECKBOX_CLASS}
            />
            <span className="text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
              전체 약관동의
            </span>
          </label>

          {AGREEMENTS.map((agreement) => (
            <Controller
              key={agreement.id}
              name={agreement.id}
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    className={CHECKBOX_CLASS}
                  />
                  <span className="flex-1 text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
                    {agreement.label}
                  </span>
                  {agreement.hasDetail && (
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-[0.375rem] text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]"
                    >
                      자세히 보기
                      <ArrowRightIcon className="size-[1.25rem] shrink-0 text-[#5d5d5d]" aria-hidden />
                    </button>
                  )}
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
            <label className="mt-[2.4375rem] flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked)}
                className={CHECKBOX_CLASS}
              />
              <span className="text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
                본인은 만 14세 이상입니다.
              </span>
            </label>
          )}
        />

        <StepNavButtons onNext={() => handleSubmit(onSubmit)()} onBack={goBack} className="tab:mt-[3.375rem]" />
      </form>
    </StepLayout>
  )
}

export { ProfileStep }

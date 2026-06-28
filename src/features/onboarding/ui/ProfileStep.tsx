'use client'

import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import { useSendVerificationCode, useVerifyCode } from '@/features/auth'
import { type ProfileFormData, EMAIL_DOMAINS } from '../model/schema'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { Input, InputField } from '@/shared/ui'
import { StepActionButton, StepSelect } from './StepInput'
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

  const phone = watch('phone')
  const verificationCode = watch('verificationCode')

  // 휴대폰 인증 (백엔드: POST /api/v2/auth/phone/send-code · verify-code)
  const { mutate: sendCode, isPending: isSending } = useSendVerificationCode()
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCode()
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null)
  const [codeMessage, setCodeMessage] = useState<string | null>(null)

  // 인증코드 유효시간 카운트다운 (백엔드 만료 3분과 동일)
  useEffect(() => {
    if (!isCodeSent || isPhoneVerified) return
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timerId)
  }, [isCodeSent, isPhoneVerified])

  const formatTimer = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

  const handleSendCode = () => {
    if (!phone) {
      setPhoneMessage('휴대폰 번호를 입력해주세요.')
      return
    }
    setPhoneMessage(null)
    sendCode(phone, {
      onSuccess: () => {
        setIsCodeSent(true)
        setIsPhoneVerified(false)
        setValue('verificationCode', '')
        setSecondsLeft(180)
        setCodeMessage(null)
        setPhoneMessage('인증번호를 발송했습니다.')
      },
      onError: (error) => {
        setPhoneMessage(error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.')
      },
    })
  }

  const handleVerifyCode = () => {
    if (!verificationCode) {
      setCodeMessage('인증번호를 입력해주세요.')
      return
    }
    verifyCode(
      { phone, code: verificationCode },
      {
        onSuccess: () => {
          setIsPhoneVerified(true)
          setSecondsLeft(0)
          setCodeMessage('인증이 완료되었습니다.')
        },
        onError: (error) => {
          setCodeMessage(error instanceof Error ? error.message : '인증번호 확인에 실패했습니다.')
        },
      },
    )
  }

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

      <div className="flex w-full max-w-[40.625rem] flex-col items-center gap-8 px-4 py-12 tab:gap-[3.625rem] tab:py-12">
        <StepIndicator />

        {/* 폼 영역 */}
        <div className="flex w-full flex-col gap-4">
          <InputField label="이메일" required>
            <div className="flex items-end gap-1">
              <Input
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
          </InputField>

          <InputField label="휴대폰 번호" required>
            <div className="flex items-end gap-2">
              <Input
                type="tel"
                placeholder="휴대폰 번호를 입력해주세요"
                {...register('phone')}
                className="flex-1"
                disabled={isPhoneVerified}
              />
              <StepActionButton onClick={handleSendCode} disabled={isSending || isPhoneVerified}>
                {isSending ? '발송 중' : isCodeSent ? '재전송' : '인증번호'}
              </StepActionButton>
            </div>
            {phoneMessage && <p className="mt-1 text-[0.8125rem] text-[#6b6b6b]">{phoneMessage}</p>}
          </InputField>

          <InputField label="인증번호" required>
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="인증번호를 입력해주세요"
                  {...register('verificationCode')}
                  className="pr-[3.5rem]"
                  disabled={!isCodeSent || isPhoneVerified}
                />
                {isCodeSent && !isPhoneVerified && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[0.875rem] font-medium text-[#3e3e3e]">
                    {formatTimer(secondsLeft)}
                  </span>
                )}
              </div>
              <StepActionButton
                onClick={handleVerifyCode}
                disabled={!isCodeSent || isPhoneVerified || isVerifying}
              >
                {isPhoneVerified ? '완료' : isVerifying ? '확인 중' : '확인'}
              </StepActionButton>
            </div>
            {codeMessage && <p className="mt-1 text-[0.8125rem] text-[#6b6b6b]">{codeMessage}</p>}
          </InputField>
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

      <StepNavButtons onNext={() => handleSubmit(onSubmit)()} onBack={goBack} />
    </StepLayout>
  )
}

export { ProfileStep }

'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
import { cn } from '@/shared/lib/cn'
import { Input, InputField, HelpMessage, Button } from '@/shared/ui'
import type { ProfileFormData } from '../model/schema'
import { usePhoneVerification } from '../model/usePhoneVerification'
import { STEP_LAYOUT } from '../model/stepLayout'
import { getEmailVerificationConfig } from '../api/onboarding.api'
import {
  PHONE_FAILURE_THRESHOLD,
  hasEmailVerification,
  shouldOfferEmailVerification,
} from '../model/contactVerification'
import { EmailVerificationSection } from './EmailVerificationSection'
import { useOnboardingForm } from '../model/useOnboardingForm'

const subscribeToStaticSession = () => () => undefined

const lockedInputProps = (locked: boolean) =>
  locked
    ? {
        readOnly: true,
        tabIndex: -1,
        onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => event.preventDefault(),
      }
    : {}

interface PhoneVerificationSectionProps {
  control: Control<ProfileFormData>
  register: UseFormRegister<ProfileFormData>
  setValue: UseFormSetValue<ProfileFormData>
  getValues: UseFormGetValues<ProfileFormData>
}

const PhoneVerificationSection = ({
  control,
  register,
  setValue,
  getValues,
}: PhoneVerificationSectionProps) => {
  const [phone = '', verificationCode = '', phoneVerified = false] = useWatch({
    control,
    name: ['phone', 'verificationCode', 'phoneVerified'],
  })
  const profile = useWatch({ control }) as ProfileFormData
  const emailMethod = profile.verificationMethod === 'email'
  const failures = profile.phoneFailureCount ?? 0
  const emailConfig = useQuery({
    queryKey: ['signup-email-verification-config'],
    queryFn: getEmailVerificationConfig,
    enabled: failures >= PHONE_FAILURE_THRESHOLD || emailMethod,
    retry: false,
    staleTime: 60_000,
  })
  const socialEmail = useSyncExternalStore(
    subscribeToStaticSession,
    () => loadSocialSignupSession()?.email ?? '',
    () => '',
  )

  useEffect(() => {
    if (socialEmail && !emailMethod) setValue('email', socialEmail)
  }, [setValue, socialEmail, emailMethod])

  const verification = usePhoneVerification({
    onCodeSent: () => setValue('verificationCode', ''),
    isVerified: phoneVerified,
    onVerifiedChange: (verified) => {
      if (getValues('verificationMethod') !== 'email')
        setValue('phoneVerified', verified, { shouldValidate: true })
    },
    onFailure: () => {
      if (getValues('verificationMethod') !== 'email') {
        setValue('phoneFailureCount', Math.min(99, (getValues('phoneFailureCount') ?? 0) + 1), {
          shouldDirty: true,
        })
        useOnboardingForm.getState().saveDraft('profile', getValues())
      }
    },
  })

  return (
    <div className={cn('flex w-full flex-col', STEP_LAYOUT.fieldGap)}>
      <InputField label="이메일" required>
        <Input
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          aria-label="가입 인증 이메일"
          className="h-12"
          placeholder="이메일을 입력해주세요"
          {...register('email')}
          {...lockedInputProps(emailMethod ? hasEmailVerification(profile) : !!socialEmail)}
        />
      </InputField>

      {emailMethod ? (
        <EmailVerificationSection
          control={control}
          register={register}
          setValue={setValue}
          getValues={getValues}
          supported={emailConfig.data?.enabled === true}
        />
      ) : (
        <>
          <InputField label="휴대폰 번호" required>
            <div className="flex items-end gap-2">
              <Input
                type="tel"
                placeholder="휴대폰 번호를 입력해주세요"
                {...register('phone')}
                className="h-12 min-w-0 flex-1"
                aria-label="휴대폰 번호"
                disabled={verification.isVerified}
              />
              <div className="flex w-28 shrink-0">
                <Button
                  size="lg"
                  intent="dark"
                  width="full"
                  onClick={() => verification.sendCode(phone)}
                  disabled={verification.isSending || verification.isVerified}
                >
                  {verification.isSending
                    ? '발송 중'
                    : verification.isCodeSent
                      ? '재전송'
                      : '인증번호'}
                </Button>
              </div>
            </div>
            {verification.phoneMessage && (
              <HelpMessage
                status={verification.phoneMessage.status}
                icon={verification.phoneMessage.icon}
                className="mt-1"
              >
                {verification.phoneMessage.text}
              </HelpMessage>
            )}
          </InputField>

          <InputField label="인증번호" required>
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="인증번호를 입력해주세요"
                  {...register('verificationCode')}
                  className="h-12 min-w-0 pr-[3.5rem]"
                  aria-label="휴대폰 인증번호"
                  {...lockedInputProps(!verification.isCodeSent || verification.isVerified)}
                />
                {verification.isCodeSent && !verification.isVerified && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[0.875rem] font-medium text-neutral-850">
                    {verification.timer}
                  </span>
                )}
              </div>
              <div className="flex w-28 shrink-0">
                <Button
                  size="lg"
                  intent="dark"
                  width="full"
                  onClick={() => verification.verifyCode(phone, verificationCode)}
                  disabled={
                    !verification.isCodeSent ||
                    verification.isExpired ||
                    verification.isVerified ||
                    verification.isVerifying
                  }
                >
                  {verification.isVerified ? '완료' : verification.isVerifying ? '확인 중' : '확인'}
                </Button>
              </div>
            </div>
            {verification.codeMessage && (
              <HelpMessage status={verification.codeMessage.status} className="mt-1">
                {verification.codeMessage.text}
              </HelpMessage>
            )}
          </InputField>
          {!phoneVerified &&
            shouldOfferEmailVerification(failures, emailConfig.data?.enabled === true) && (
              <section
                aria-label="전화 인증 실패 후 대안"
                className="rounded-xl border border-primary-200 bg-point-50 p-4"
              >
                <h2 className="font-cafe24 text-lg text-primary-700">
                  문자 인증이 계속 실패하나요?
                </h2>
                <p className="mt-2 mb-4 text-sm text-neutral-700">
                  인증 오류가 반복되면 이메일로 가입을 이어갈 수 있어요.
                </p>
                <Button
                  size="lg"
                  intent="secondary"
                  width="full"
                  onClick={() => {
                    setValue('phoneVerified', false)
                    setValue('verificationMethod', 'email', {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    useOnboardingForm.getState().saveDraft('profile', getValues())
                  }}
                >
                  이메일로 인증하기
                </Button>
              </section>
            )}
          {failures >= PHONE_FAILURE_THRESHOLD && emailConfig.isError && (
            <div aria-live="polite">
              <HelpMessage status="error">
                이메일 인증 연결을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.
              </HelpMessage>
              <Button
                size="lg"
                intent="ghost"
                width="full"
                onClick={() => void emailConfig.refetch()}
                disabled={emailConfig.isFetching}
              >
                이메일 인증 지원 다시 확인
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { PhoneVerificationSection }

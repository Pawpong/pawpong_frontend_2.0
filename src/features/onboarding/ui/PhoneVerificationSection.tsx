'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { loadSocialSignupSession } from '@/features/auth'
import { Input, InputField, HelpMessage } from '@/shared/ui'
import type { ProfileFormData } from '../model/schema'
import { usePhoneVerification } from '../model/usePhoneVerification'
import { StepActionButton } from './StepInput'

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
}

const PhoneVerificationSection = ({
  control,
  register,
  setValue,
}: PhoneVerificationSectionProps) => {
  const [phone = '', verificationCode = '', phoneVerified = false] = useWatch({
    control,
    name: ['phone', 'verificationCode', 'phoneVerified'],
  })
  const socialEmail = useSyncExternalStore(
    subscribeToStaticSession,
    () => loadSocialSignupSession()?.email ?? '',
    () => '',
  )

  useEffect(() => {
    if (socialEmail) setValue('email', socialEmail)
  }, [setValue, socialEmail])

  const verification = usePhoneVerification({
    onCodeSent: () => setValue('verificationCode', ''),
    isVerified: phoneVerified,
    onVerifiedChange: (verified) => setValue('phoneVerified', verified, { shouldValidate: true }),
  })

  return (
    <div className="flex w-full flex-col gap-4">
      <InputField label="이메일" required>
        <Input
          type="text"
          placeholder="이메일을 입력해주세요"
          {...register('email')}
          {...lockedInputProps(!!socialEmail)}
        />
      </InputField>

      <InputField label="휴대폰 번호" required>
        <div className="flex items-end gap-2">
          <Input
            type="tel"
            placeholder="휴대폰 번호를 입력해주세요"
            {...register('phone')}
            className="flex-1"
            disabled={verification.isVerified}
          />
          <StepActionButton
            onClick={() => verification.sendCode(phone)}
            disabled={verification.isSending || verification.isVerified}
          >
            {verification.isSending ? '발송 중' : verification.isCodeSent ? '재전송' : '인증번호'}
          </StepActionButton>
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
              className="pr-[3.5rem]"
              {...lockedInputProps(!verification.isCodeSent || verification.isVerified)}
            />
            {verification.isCodeSent && !verification.isVerified && (
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[0.875rem] font-medium text-neutral-850">
                {verification.timer}
              </span>
            )}
          </div>
          <StepActionButton
            onClick={() => verification.verifyCode(phone, verificationCode)}
            disabled={
              !verification.isCodeSent ||
              verification.isExpired ||
              verification.isVerified ||
              verification.isVerifying
            }
          >
            {verification.isVerified ? '완료' : verification.isVerifying ? '확인 중' : '확인'}
          </StepActionButton>
        </div>
        {verification.codeMessage && (
          <HelpMessage status={verification.codeMessage.status} className="mt-1">
            {verification.codeMessage.text}
          </HelpMessage>
        )}
      </InputField>
    </div>
  )
}

export { PhoneVerificationSection }

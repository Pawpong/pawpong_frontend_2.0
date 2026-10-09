'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form'
import { z } from 'zod'
import { loadSocialSignupSession } from '@/shared/lib/socialSignupSession'
import { Button, HelpMessage, Input, InputField } from '@/shared/ui'
import {
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
  type EmailChallenge,
} from '../api/onboarding.api'
import { hasEmailVerification, normalizeSignupEmail } from '../model/contactVerification'
import type { ProfileFormData } from '../model/schema'
import { useOnboardingForm } from '../model/useOnboardingForm'

interface Props {
  control: Control<ProfileFormData>
  register: UseFormRegister<ProfileFormData>
  setValue: UseFormSetValue<ProfileFormData>
  getValues: UseFormGetValues<ProfileFormData>
  supported: boolean
}

export const EmailVerificationSection = ({
  control,
  register,
  setValue,
  getValues,
  supported,
}: Props) => {
  const profile = useWatch({ control }) as ProfileFormData
  const [challenge, setChallenge] = useState<(EmailChallenge & { offsetMs: number }) | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [clock, setClock] = useState(() => Date.now())
  const mounted = useRef(false)
  const inFlight = useRef(false)
  const previousEmail = useRef(normalizeSignupEmail(profile.email ?? ''))
  const send = useMutation({
    mutationFn: ({ email, tempId }: { email: string; tempId: string }) =>
      sendEmailVerificationCode(email, tempId),
  })
  const verify = useMutation({
    mutationFn: ({
      email,
      tempId,
      challengeId,
      code,
    }: {
      email: string
      tempId: string
      challengeId: string
      code: string
    }) => verifyEmailVerificationCode(email, tempId, challengeId, code),
  })
  const verified = hasEmailVerification(profile, clock)
  const proofExpired = Boolean(
    profile.emailVerificationExpiresAt &&
    Date.parse(profile.emailVerificationExpiresAt) <=
      clock + (profile.emailServerTimeOffsetMs ?? 0),
  )
  const serverNow = clock + (challenge?.offsetMs ?? 0)
  const remaining = challenge
    ? Math.max(0, Math.ceil((Date.parse(challenge.expiresAt) - serverNow) / 1000))
    : 0
  const resendRemaining = challenge
    ? Math.max(0, Math.ceil((Date.parse(challenge.nextSendAt) - serverNow) / 1000))
    : 0
  const busy = send.isPending || verify.isPending

  const clearProof = () => {
    setValue('emailVerified', false, { shouldDirty: true })
    setValue('emailVerifiedFor', '')
    setValue('emailVerificationToken', '')
    setValue('emailVerificationExpiresAt', '')
    useOnboardingForm.getState().saveDraft('profile', getValues())
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!challenge && !profile.emailVerified) return
    const id = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(id)
  }, [challenge, profile.emailVerified])

  useEffect(() => {
    if (!profile.emailVerified || verified) return
    setValue('emailVerified', false, { shouldDirty: true })
    setValue('emailVerificationToken', '')
    useOnboardingForm.getState().saveDraft('profile', getValues())
  }, [profile.emailVerified, verified, setValue, getValues])

  useEffect(() => {
    const email = normalizeSignupEmail(profile.email ?? '')
    if (email === previousEmail.current) return
    previousEmail.current = email
    setChallenge(null)
    setMessage(null)
    setValue('emailVerified', false, { shouldDirty: true })
    setValue('emailVerifiedFor', '')
    setValue('emailVerificationToken', '')
    setValue('emailVerificationExpiresAt', '')
    useOnboardingForm.getState().saveDraft('profile', getValues())
  }, [profile.email, setValue, getValues])

  const context = () => ({
    email: normalizeSignupEmail(getValues('email')),
    tempId: loadSocialSignupSession()?.tempId ?? '',
  })
  const isCurrent = (input: ReturnType<typeof context>) =>
    mounted.current &&
    getValues('verificationMethod') === 'email' &&
    context().email === input.email &&
    context().tempId === input.tempId

  const sendCode = async () => {
    if (inFlight.current || busy || verified || !supported || resendRemaining > 0) return
    const input = context()
    if (!z.email().safeParse(input.email).success) {
      setMessage({ text: '인증받을 이메일 주소를 확인해주세요.', error: true })
      return
    }
    if (!input.tempId) {
      setMessage({
        text: '소셜 가입 정보 유효 시간이 지났어요. 로그인 화면에서 다시 시작해 주세요.',
        error: true,
      })
      return
    }
    inFlight.current = true
    clearProof()
    setValue('emailVerificationCode', '')
    setMessage(null)
    try {
      const result = await send.mutateAsync(input)
      if (!isCurrent(input)) return
      setChallenge({ ...result, offsetMs: Date.parse(result.serverTime) - Date.now() })
      setClock(Date.now())
      setMessage({
        text: '인증 메일을 보냈어요. 받은편지함과 스팸함을 확인해 주세요.',
        error: false,
      })
    } catch (error) {
      if (isCurrent(input))
        setMessage({
          text:
            error instanceof Error
              ? error.message
              : '인증 메일을 보내지 못했어요. 다시 시도해 주세요.',
          error: true,
        })
    } finally {
      inFlight.current = false
    }
  }

  const verifyCode = async () => {
    if (inFlight.current || busy || verified || !challenge || remaining <= 0 || !supported) return
    const input = context()
    const code = (getValues('emailVerificationCode') ?? '').trim()
    if (!/^\d{6}$/.test(code)) {
      setMessage({ text: '메일로 받은 인증번호 숫자 6자리를 입력해주세요.', error: true })
      return
    }
    inFlight.current = true
    setMessage(null)
    try {
      const result = await verify.mutateAsync({
        ...input,
        challengeId: challenge.challengeId,
        code,
      })
      if (!isCurrent(input)) return
      setValue('emailVerifiedFor', input.email)
      setValue('emailVerificationToken', result.emailVerificationToken)
      setValue('emailVerificationExpiresAt', result.expiresAt)
      setValue('emailServerTimeOffsetMs', Date.parse(result.serverTime) - Date.now())
      setValue('emailVerified', true, { shouldValidate: true, shouldDirty: true })
      setValue('emailVerificationCode', '')
      useOnboardingForm.getState().saveDraft('profile', getValues())
      setClock(Date.now())
      setMessage({ text: '이메일 인증을 마쳤어요.', error: false })
    } catch (error) {
      if (isCurrent(input))
        setMessage({
          text: error instanceof Error ? error.message : '인증번호를 다시 확인해주세요.',
          error: true,
        })
    } finally {
      inFlight.current = false
    }
  }

  return (
    <section
      aria-label="이메일 가입 인증"
      className="flex flex-col gap-4 rounded-xl border border-primary-200 bg-point-50 p-4"
    >
      <div>
        <h2 className="font-cafe24 text-lg text-primary-700">이메일로 이어가기</h2>
        <p className="mt-1 text-sm text-neutral-700">
          위 이메일로 인증번호를 받아 가입을 이어갈 수 있어요.
        </p>
      </div>
      {!supported && (
        <p role="status" className="text-sm text-neutral-700">
          이메일 인증 연결을 확인하고 있어요. 쓸 수 없다면 휴대폰 인증으로 돌아가 주세요.
        </p>
      )}
      <Button
        size="lg"
        intent="secondary"
        width="full"
        onClick={sendCode}
        disabled={busy || verified || !supported || resendRemaining > 0}
      >
        {send.isPending
          ? '메일 발송 중'
          : verified
            ? '이메일 인증 완료'
            : resendRemaining > 0
              ? `${resendRemaining}초 후 재전송`
              : challenge
                ? '인증 메일 재전송'
                : '인증 메일 받기'}
      </Button>
      <InputField label="이메일 인증번호" required>
        <div className="flex min-w-0 items-end gap-2">
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="이메일 인증번호"
            aria-describedby="signup-email-status"
            maxLength={6}
            placeholder="숫자 6자리"
            className="h-12 min-w-0 flex-1"
            {...register('emailVerificationCode')}
            disabled={!challenge || verified || busy || remaining <= 0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void verifyCode()
              }
            }}
          />
          <div className="w-28 shrink-0">
            <Button
              size="lg"
              intent="dark"
              width="full"
              onClick={verifyCode}
              disabled={!challenge || verified || busy || remaining <= 0 || !supported}
            >
              {verify.isPending ? '확인 중' : verified ? '완료' : '확인'}
            </Button>
          </div>
        </div>
        {challenge && !verified && (
          <p className="mt-1 text-xs text-neutral-700">
            {remaining > 0
              ? `남은 시간 ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
              : '인증번호 유효 시간이 지났어요. 인증 메일을 다시 받아 주세요.'}
          </p>
        )}
      </InputField>
      <div id="signup-email-status" aria-live="polite">
        {proofExpired ? (
          <HelpMessage status="error">
            이메일 인증 유효 시간이 끝났어요. 인증 메일을 다시 받아 주세요.
          </HelpMessage>
        ) : (
          message && (
            <HelpMessage status={message.error ? 'error' : verified ? 'success' : 'default'}>
              {message.text}
            </HelpMessage>
          )
        )}
        {verified && (
          <p className="mt-1 text-xs text-neutral-700">
            이메일로 가입 인증을 완료했어요. 전화번호는 인증된 연락처로 저장하지 않아요.
          </p>
        )}
      </div>
      {verified && (
        <Button
          size="lg"
          intent="ghost"
          width="full"
          onClick={() => {
            clearProof()
            setChallenge(null)
            setMessage(null)
          }}
        >
          다른 이메일로 다시 인증
        </Button>
      )}
      <Button
        size="lg"
        intent="ghost"
        width="full"
        onClick={() => {
          clearProof()
          setValue('verificationMethod', 'phone', { shouldValidate: true, shouldDirty: true })
          useOnboardingForm.getState().saveDraft('profile', getValues())
        }}
      >
        휴대폰 인증으로 돌아가기
      </Button>
    </section>
  )
}

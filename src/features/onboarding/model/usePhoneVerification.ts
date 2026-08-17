'use client'

import { useEffect, useState } from 'react'
import { CheckRoundedIcon } from '@/shared/assets/icons'
import { useSendVerificationCode, useVerifyCode } from '@/features/auth'
import type { HelpMessageState } from '@/shared/ui'

/** 백엔드 인증코드 만료(3분)와 동일 */
const CODE_TTL_SECONDS = 180

interface UsePhoneVerificationParams {
  /** 발송 성공 시 입력돼 있던 코드를 비우기 위한 콜백 */
  onCodeSent?: () => void
  isVerified: boolean
  onVerifiedChange: (verified: boolean) => void
}

/**
 * 휴대폰 인증 (POST /api/v2/auth/phone/send-code · verify-code)
 *
 * 발송/확인 요청과 그에 딸린 상태(발송 여부·인증 완료·남은 시간·안내 메시지)를 한곳에 모은다.
 */
export const usePhoneVerification = ({
  onCodeSent,
  isVerified,
  onVerifiedChange,
}: UsePhoneVerificationParams) => {
  const { mutate: sendCodeMutate, isPending: isSending } = useSendVerificationCode()
  const { mutate: verifyCodeMutate, isPending: isVerifying } = useVerifyCode()

  const [isCodeSent, setIsCodeSent] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [phoneMessage, setPhoneMessage] = useState<HelpMessageState | null>(null)
  const [codeMessage, setCodeMessage] = useState<HelpMessageState | null>(null)

  // 인증코드 유효시간 카운트다운
  useEffect(() => {
    if (!isCodeSent || isVerified) return
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timerId)
  }, [isCodeSent, isVerified])

  const sendCode = (phone: string) => {
    if (!phone) {
      setPhoneMessage({ text: '휴대폰 번호를 입력해주세요.', status: 'error' })
      return
    }
    setPhoneMessage(null)
    sendCodeMutate(phone, {
      onSuccess: () => {
        setIsCodeSent(true)
        onVerifiedChange(false)
        setSecondsLeft(CODE_TTL_SECONDS)
        setCodeMessage(null)
        onCodeSent?.()
        setPhoneMessage({
          text: '인증번호를 발송했습니다.',
          status: 'default',
          icon: CheckRoundedIcon,
        })
      },
      onError: (error) => {
        setPhoneMessage({
          text: error instanceof Error ? error.message : '인증번호 발송에 실패했습니다.',
          status: 'error',
        })
      },
    })
  }

  const verifyCode = (phone: string, code: string) => {
    if (isCodeSent && secondsLeft <= 0) {
      setCodeMessage({
        text: '인증시간이 만료되었습니다. 인증번호를 재전송해주세요.',
        status: 'error',
      })
      return
    }
    if (!code) {
      setCodeMessage({ text: '인증번호를 입력해주세요.', status: 'error' })
      return
    }
    verifyCodeMutate(
      { phone, code },
      {
        onSuccess: () => {
          onVerifiedChange(true)
          setSecondsLeft(0)
          setCodeMessage({ text: '인증되었습니다.', status: 'success' })
        },
        onError: (error) => {
          setCodeMessage({
            text: error instanceof Error ? error.message : '인증번호를 다시 입력해주세요',
            status: 'error',
          })
        },
      },
    )
  }

  return {
    isCodeSent,
    isVerified,
    isSending,
    isVerifying,
    isExpired: isCodeSent && !isVerified && secondsLeft <= 0,
    phoneMessage,
    codeMessage,
    /** 남은 시간 m:ss */
    timer: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`,
    sendCode,
    verifyCode,
  }
}

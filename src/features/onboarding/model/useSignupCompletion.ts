'use client'

import { useRouter } from 'next/navigation'
import { saveAuthTokens } from '@/shared/lib/saveAuthTokens'
import {
  clearSocialSignupSession,
  loadSocialSignupSession,
  type SocialSignupSession,
} from '@/shared/lib/socialSignupSession'
import type { RegisterTokens } from '@/shared/types'
import { useOnboarding } from './OnboardingContext'
import { useOnboardingForm } from './useOnboardingForm'
import { SIGNUP_ERROR } from './signupErrors'

/**
 * 입양자·브리더 가입의 공통 앞뒤 처리.
 *
 * - 시작: 소셜 세션(tempId)이 있어야 가입 요청을 만들 수 있다
 * - 마무리: 토큰 쿠키 저장 → 세션·입력값 정리 → 완료 화면. 쿠키 저장이 실패하면
 *   가입은 됐지만 로그인이 안 된 상태라 안내와 함께 로그인 화면으로 보낸다
 */
export const useSignupCompletion = (setError: (message: string) => void) => {
  const router = useRouter()
  const { goNext } = useOnboarding()
  const finishRegistration = useOnboardingForm((state) => state.finishRegistration)

  const requireSocialSession = (): SocialSignupSession | null => {
    const social = loadSocialSignupSession()
    if (!social?.tempId) {
      setError(SIGNUP_ERROR.noSocialSession)
      return null
    }
    return social
  }

  /**
   * @param afterSignIn 쿠키가 심긴 뒤 화면 이동 전에 할 일 (예: 브리더 bio PATCH).
   *                    인증이 필요한 요청이라 로그인 상태가 된 다음에만 실행한다
   */
  const complete = async (
    tokens: RegisterTokens,
    afterSignIn?: () => Promise<void>,
  ): Promise<boolean> => {
    const signedIn = await saveAuthTokens(tokens)
    if (signedIn) await afterSignIn?.()

    clearSocialSignupSession()
    finishRegistration()

    if (!signedIn) {
      router.replace('/login?signup=completed')
      return false
    }
    goNext()
    return true
  }

  return { requireSocialSession, complete }
}

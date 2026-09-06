'use client'

import { useCallback, useEffect } from 'react'
import { SocialSignupCapture } from '@/features/auth'
import { loadSocialSignupSession, type SocialSignupSession } from '@/shared/lib/socialSignupSession'
import { useOnboardingForm } from '@/features/onboarding'

/**
 * 새 OAuth tempId가 들어오면 이전 사용자의 persist 폼을 먼저 비운다.
 *
 * URL 파라미터는 최초 진입 때 한 번만 붙는다 — 유형 선택으로 되돌아오면 쿼리가 없어
 * 캡처가 돌지 않는다. 그래서 저장된 세션이 있으면 그 tempId 로 주인을 다시 세운다.
 * (같은 tempId 면 startSession 이 no-op 이라 진행 상황은 그대로다)
 */
const SignupSessionCapture = () => {
  const startSession = useOnboardingForm((state) => state.startSession)
  const handleCapture = useCallback(
    (session: SocialSignupSession) => startSession(session.tempId),
    [startSession],
  )

  useEffect(() => {
    const stored = loadSocialSignupSession()
    if (stored?.tempId) startSession(stored.tempId)
  }, [startSession])

  return <SocialSignupCapture onCapture={handleCapture} />
}

export { SignupSessionCapture }

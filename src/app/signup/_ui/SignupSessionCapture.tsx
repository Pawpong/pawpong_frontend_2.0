'use client'

import { useCallback } from 'react'
import { SocialSignupCapture } from '@/features/auth'
import type { SocialSignupSession } from '@/shared/lib/socialSignupSession'
import { useOnboardingForm } from '@/features/onboarding'

/** 새 OAuth tempId가 들어오면 이전 사용자의 persist 폼을 먼저 비운다. */
const SignupSessionCapture = () => {
  const startSession = useOnboardingForm((state) => state.startSession)
  const handleCapture = useCallback(
    (session: SocialSignupSession) => startSession(session.tempId),
    [startSession],
  )

  return <SocialSignupCapture onCapture={handleCapture} />
}

export { SignupSessionCapture }

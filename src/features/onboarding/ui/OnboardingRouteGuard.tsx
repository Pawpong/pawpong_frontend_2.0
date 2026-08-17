'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { loadSocialSignupSession } from '@/features/auth'
import { getGuardRedirect } from '../model/onboardingGuard'
import { useOnboardingForm } from '../model/useOnboardingForm'
import { isStepForUser, type UserType } from '../model/types'

interface OnboardingRouteGuardProps {
  userType: UserType
  children: React.ReactNode
}

/**
 * 단계 건너뛰기·직접 URL 접근 차단.
 *
 * 판정 근거(completedSteps)가 sessionStorage 에 있어 미들웨어로는 못 막는다. persist 복원이
 * 끝나기 전에 판정하면 전원이 1단계로 튕기므로 hasHydrated 를 기다린다.
 */
const OnboardingRouteGuard = ({ userType, children }: OnboardingRouteGuardProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const hasHydrated = useOnboardingForm((state) => state.hasHydrated)
  const completedSteps = useOnboardingForm((state) => state.completedSteps)
  const status = useOnboardingForm((state) => state.status)
  const ownerTempId = useOnboardingForm((state) => state.ownerTempId)

  // sessionStorage 읽기 + JSON.parse — 마운트 후 바뀌지 않으므로 렌더마다 다시 읽지 않는다
  const sessionTempId = useMemo(() => loadSocialSignupSession()?.tempId, [])

  const requestedStep = pathname.split('/').pop() ?? ''
  const redirectTo =
    hasHydrated && isStepForUser(userType, requestedStep)
      ? getGuardRedirect({
          userType,
          requestedStep,
          completedSteps,
          status,
          // 이 탭에서 시작한 온보딩인지 — 소셜 세션과 스토어 주인이 같아야 한다
          hasValidSession: !!ownerTempId && ownerTempId === sessionTempId,
        })
      : null

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo)
  }, [redirectTo, router])

  // 복원 전 / 이동 대기 중에는 내용을 그리지 않는다 (한 프레임 보였다 튕기는 깜빡임 방지)
  if (!hasHydrated || redirectTo) return null

  return <>{children}</>
}

export { OnboardingRouteGuard }

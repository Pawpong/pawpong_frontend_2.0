'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import {
  OnboardingExitGuard,
  OnboardingProvider,
  OnboardingRouteGuard,
  isValidUserType, // [refactored]
} from '@/features/onboarding'

const OnboardingLayout = ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ type: string }>
}) => {
  const { type } = use(params)

  if (!isValidUserType(type)) {
    notFound()
  }

  // [refactored] 현재 스텝 인덱스는 Provider 가 pathname 에서 파생한다
  return (
    <OnboardingProvider userType={type}>
      <OnboardingExitGuard>
        <OnboardingRouteGuard userType={type}>{children}</OnboardingRouteGuard>
      </OnboardingExitGuard>
    </OnboardingProvider>
  )
}

export default OnboardingLayout

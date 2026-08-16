'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import {
  OnboardingExitGuard,
  OnboardingProvider,
  OnboardingRouteGuard,
  StepProgressBar,
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
      {/* 진행바는 가드 밖 — 복원 대기 동안 헤더까지 사라지면 깜빡임이 커진다 */}
      <StepProgressBar />
      <OnboardingExitGuard>
        <OnboardingRouteGuard userType={type}>{children}</OnboardingRouteGuard>
      </OnboardingExitGuard>
    </OnboardingProvider>
  )
}

export default OnboardingLayout

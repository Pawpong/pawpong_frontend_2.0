'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { StepRenderer, isStepForUser, isValidUserType } from '@/features/onboarding'

const OnboardingStepPage = ({ params }: { params: Promise<{ type: string; step: string }> }) => {
  const { type, step } = use(params)

  if (!isValidUserType(type)) {
    notFound()
  }

  // [refactored] 타입 가드 덕분에 as 캐스팅 제거
  if (!isStepForUser(type, step)) {
    notFound()
  }

  return <StepRenderer stepId={step} />
}

export default OnboardingStepPage

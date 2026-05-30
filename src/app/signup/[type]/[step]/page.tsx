'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { StepRenderer, ONBOARDING_STEPS, isValidUserType } from '@/features/onboarding' // [refactored]

const OnboardingStepPage = ({ params }: { params: Promise<{ type: string; step: string }> }) => {
  const { type, step } = use(params)

  if (!isValidUserType(type)) {
    notFound()
  }

  // [refactored] 타입 가드 덕분에 as 캐스팅 제거
  const isValidStep = ONBOARDING_STEPS[type].some((s) => s.id === step)

  if (!isValidStep) {
    notFound()
  }

  return <StepRenderer stepId={step} />
}

export default OnboardingStepPage

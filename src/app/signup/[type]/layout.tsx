'use client'

import { notFound, usePathname } from 'next/navigation'
import { use } from 'react'
import {
  OnboardingProvider,
  StepProgressBar,
  ONBOARDING_STEPS,
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
  const pathname = usePathname()

  if (!isValidUserType(type)) {
    notFound()
  }

  // [refactored] 타입 가드 덕분에 type이 UserType으로 좁혀짐
  const steps = ONBOARDING_STEPS[type]
  const currentStepId = pathname.split('/').pop()
  const initialStepIndex = Math.max(
    steps.findIndex((s) => s.id === currentStepId),
    0,
  )

  return (
    <OnboardingProvider userType={type} initialStepIndex={initialStepIndex}>
      <StepProgressBar />
      {children}
    </OnboardingProvider>
  )
}

export default OnboardingLayout

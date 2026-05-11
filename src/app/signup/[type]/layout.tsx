'use client'

import { notFound, usePathname } from 'next/navigation'
import { use } from 'react'
import { OnboardingProvider, ONBOARDING_STEPS } from '@/features/onboarding'
import type { UserType } from '@/features/onboarding'

const VALID_TYPES: UserType[] = ['general', 'breeder']

const OnboardingLayout = ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ type: string }>
}) => {
  const { type } = use(params)
  const pathname = usePathname()

  if (!VALID_TYPES.includes(type as UserType)) {
    notFound()
  }

  const steps = ONBOARDING_STEPS[type as UserType]
  const currentStepId = pathname.split('/').pop()
  const initialStepIndex = Math.max(
    steps.findIndex((s) => s.id === currentStepId),
    0,
  )

  return (
    <OnboardingProvider
      userType={type as UserType}
      initialStepIndex={initialStepIndex}
    >
      {children}
    </OnboardingProvider>
  )
}

export default OnboardingLayout

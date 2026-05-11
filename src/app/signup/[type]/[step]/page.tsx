'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { StepRenderer, ONBOARDING_STEPS } from '@/features/onboarding'
import type { UserType } from '@/features/onboarding'

const VALID_TYPES: UserType[] = ['general', 'breeder']

const OnboardingStepPage = ({
  params,
}: {
  params: Promise<{ type: string; step: string }>
}) => {
  const { type, step } = use(params)

  if (!VALID_TYPES.includes(type as UserType)) {
    notFound()
  }

  const steps = ONBOARDING_STEPS[type as UserType]
  const isValidStep = steps.some((s) => s.id === step)

  if (!isValidStep) {
    notFound()
  }

  return <StepRenderer stepId={step} />
}

export default OnboardingStepPage

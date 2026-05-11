'use client'

import { notFound } from 'next/navigation'
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

  if (!VALID_TYPES.includes(type as UserType)) {
    notFound()
  }

  return <OnboardingProvider userType={type as UserType}>{children}</OnboardingProvider>
}

export default OnboardingLayout

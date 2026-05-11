import { redirect, notFound } from 'next/navigation'
import { ONBOARDING_STEPS } from '@/features/onboarding'
import type { UserType } from '@/features/onboarding'

const VALID_TYPES: UserType[] = ['general', 'breeder']

const OnboardingTypePage = async ({
  params,
}: {
  params: Promise<{ type: string }>
}) => {
  const { type } = await params

  if (!VALID_TYPES.includes(type as UserType)) {
    notFound()
  }

  const firstStep = ONBOARDING_STEPS[type as UserType][0]
  redirect(`/signup/${type}/${firstStep.id}`)
}

export default OnboardingTypePage

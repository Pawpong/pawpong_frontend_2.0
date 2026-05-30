import { redirect, notFound } from 'next/navigation'
import { ONBOARDING_STEPS, isValidUserType } from '@/features/onboarding' // [refactored]

const OnboardingTypePage = async ({ params }: { params: Promise<{ type: string }> }) => {
  const { type } = await params

  if (!isValidUserType(type)) {
    notFound()
  }

  // [refactored] 타입 가드 덕분에 as 캐스팅 제거
  const firstStep = ONBOARDING_STEPS[type][0]
  redirect(`/signup/${type}/${firstStep.id}`)
}

export default OnboardingTypePage

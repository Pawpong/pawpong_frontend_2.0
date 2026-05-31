'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '../model/OnboardingContext'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepNavButtons } from './StepNavButtons'

const CompleteStep = () => {
  const router = useRouter()
  const { userType } = useOnboarding()

  const subtitle = userType === 'breeder' ? '포퐁에 오신걸 환영해요!' : '포퐁에 오신걸 환영해요!'

  return (
    <StepLayout className="flex-1">
      <StepTitle subtitle={subtitle}>가입완료</StepTitle>

      <div className="flex flex-col items-center justify-center px-4 py-12 tab:px-20">
        <div className="h-[17.3125rem] w-[14.875rem] overflow-hidden rounded-2xl bg-[#8ed4ff] tab:w-[38.8125rem]">
          <Image
            src="/images/onboarding/onboarding-banner-small.svg"
            alt="가입완료 배너"
            width={238}
            height={277}
            className="size-full object-cover tab:hidden"
            priority
          />
          <Image
            src="/images/onboarding/onboarding-banner.svg"
            alt="가입완료 배너"
            width={621}
            height={277}
            className="hidden size-full object-cover tab:block"
            priority
          />
        </div>
      </div>

      <StepNavButtons
        onNext={() => router.push('/')}
        nextLabel="홈으로"
        extraButtons={
          <button type="button" className="text-base font-medium text-[#3e3e3e]">
            문의하기
          </button>
        }
      />
    </StepLayout>
  )
}

export { CompleteStep }

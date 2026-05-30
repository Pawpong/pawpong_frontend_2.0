'use client'

import Image from 'next/image'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'
import { useOnboarding } from '../model/OnboardingContext'

const StepProgressBar = () => {
  const { currentStepIndex, steps } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  const progressPercent = Math.round(((currentStepIndex + 1) / (visibleSteps.length + 1)) * 100)

  return (
    <div className="flex w-full items-center justify-center bg-white px-4 py-1 tab:px-12 pc:px-20 tab:py-2">
      <div className="flex w-full items-center justify-center gap-[0.125rem]">
        <div
          className={cn(
            cafe24Proup.className,
            'flex flex-col items-center font-cafe24 text-[0.625rem] font-bold leading-[1.5] tab:text-[0.875rem]',
          )}
        >
          <span className="-mb-[0.3125rem] text-[#a9835a]">EXP</span>
          <span className="text-[#39d264]">{progressPercent}%</span>
        </div>
        <div className="relative px-2 py-[0.125rem]">
          <Image
            src="/images/onboarding/progress-bar.svg"
            alt={`진행률 ${progressPercent}%`}
            width={558}
            height={26}
            className="h-[0.829rem] w-full max-w-[17.562rem] tab:h-[1.644rem] tab:max-w-[34.846rem]"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export { StepProgressBar }

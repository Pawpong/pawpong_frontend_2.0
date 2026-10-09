'use client'

import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { PixelProgressBar } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'

const StepProgressBar = () => {
  const { currentStepIndex, steps } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  const progressPercent = Math.round(((currentStepIndex + 1) / (visibleSteps.length + 1)) * 100)

  return <OnboardingProgressBar percent={progressPercent} />
}

const OnboardingProgressBar = ({ percent }: { percent: number }) => {
  const gnbH = useGnbHeight() // 위쪽 sticky 헤더(로고) 아래에 고정
  const progressPercent = Math.min(100, Math.max(0, percent))

  return (
    <div
      style={{ top: gnbH }}
      className="sticky z-20 flex w-full items-center justify-center bg-white px-4 py-1 tab:px-20 tab:py-2"
    >
      <div className="flex w-full max-w-[20.3125rem] min-w-0 items-center justify-center gap-[0.125rem] pc:max-w-[39rem]">
        <div
          className={cn(
            cafe24Proup.className,
            'flex flex-col items-center font-cafe24 text-[0.625rem] leading-[1.5] font-bold pc:text-[0.875rem]',
          )}
        >
          <span className="-mb-[0.3125rem] text-[#a9835a]">EXP</span>
          <span className="text-[#39d264]">{progressPercent}%</span>
        </div>
        <div className="relative min-w-0 flex-1 px-1 py-[0.125rem] pc:px-2">
          <div className="h-[0.829rem] w-full max-w-[17.562rem] pc:h-[1.644rem] pc:max-w-[34.846rem]">
            <PixelProgressBar percent={progressPercent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { StepProgressBar, OnboardingProgressBar }

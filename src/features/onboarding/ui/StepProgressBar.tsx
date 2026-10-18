'use client'

import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { PixelProgressBar } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'

const StepProgressBar = () => {
  const { currentStepIndex, steps } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  const progressPercent = Math.round(((currentStepIndex + 1) / (visibleSteps.length + 1)) * 100)

  return <OnboardingProgressBar percent={progressPercent} />
}

const OnboardingProgressBar = ({ percent }: { percent: number }) => {
  const progressPercent = Math.min(100, Math.max(0, percent))

  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex w-full min-w-0 items-center gap-3">
        <div
          className={cn(
            cafe24Proup.className,
            'flex w-10 shrink-0 flex-col items-center font-cafe24 text-body-sm leading-normal',
          )}
        >
          <span className="text-primary-500">EXP</span>
          <span className="text-primary-700">{progressPercent}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-5 w-full tab:h-7">
            <PixelProgressBar percent={progressPercent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { StepProgressBar, OnboardingProgressBar }

'use client'

import { ArrowRightIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'
import { useOnboarding } from '../model/OnboardingContext'

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()

  return (
    <div className="flex items-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {index > 0 && (
            <ArrowRightIcon
              className="size-[0.75rem] shrink-0 text-[#5d5d5d] tab:size-[1.5rem]"
              aria-hidden
            />
          )}
          <div
            className={cn(
              'flex items-center rounded-full px-[0.4375rem] py-[0.375rem] tab:px-[1.25rem] tab:py-[0.75rem]',
              index === currentStepIndex ? 'bg-[#5d5d5d]' : 'bg-transparent',
            )}
          >
            <div className="flex size-[1.173rem] items-center justify-center rounded-full tab:size-[2.346rem]">
              <span
                className={cn(
                  'text-[0.75rem] font-medium tab:text-[1.173rem]',
                  index === currentStepIndex ? 'text-white' : 'text-[#5d5d5d]',
                )}
              >
                {index + 1}
              </span>
            </div>
            <span
              className={cn(
                'text-[0.75rem] font-bold leading-[1.5] whitespace-nowrap tab:text-[1rem]',
                index === currentStepIndex ? 'text-white' : 'text-[#5d5d5d]',
              )}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export { StepIndicator }

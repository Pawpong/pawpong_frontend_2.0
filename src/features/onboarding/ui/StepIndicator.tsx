'use client'

import Image from 'next/image'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { useOnboarding } from '../model/OnboardingContext'

interface StepItemProps {
  label: string
  index: number
  isActive: boolean
  showArrowBefore: boolean
}

const StepItem = ({ label, index, isActive, showArrowBefore }: StepItemProps) => (
  <>
    {showArrowBefore && (
      <div className="relative size-[0.875rem] shrink-0 tab:size-8">
        <Image
          src="/images/onboarding/arrow-onboarding.svg"
          alt=""
          fill
          sizes="(max-width: 768px) 14px, 32px"
          className="object-contain"
        />
      </div>
    )}
    <div className="relative flex h-[2.125rem] w-[6.641rem] items-center justify-center p-2 tab:h-[3.837rem] tab:w-[11.991rem]">
      <Image
        src={
          isActive
            ? '/images/onboarding/btn-pixel-step-active.svg'
            : '/images/onboarding/btn-pixel-step-inactive.svg'
        }
        alt=""
        fill
        sizes="(max-width: 768px) 106px, 192px"
        className="object-contain"
      />
      <span
        className={cn(
          cafe24Proup.className,
          'relative z-10 font-cafe24 text-[0.625rem] leading-[1.5] font-bold whitespace-nowrap tab:text-base',
          isActive ? 'text-[#a9835a]' : 'text-neutral-200',
        )}
      >
        {index + 1}. {label}
      </span>
    </div>
  </>
)

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')

  return (
    <div className="flex items-center">
      {visibleSteps.map((step, index) => (
        <StepItem
          key={step.id}
          label={step.label}
          index={index}
          isActive={index === currentStepIndex}
          showArrowBefore={index > 0}
        />
      ))}
    </div>
  )
}

export { StepIndicator }

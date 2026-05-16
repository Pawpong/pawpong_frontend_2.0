'use client'

import { ArrowRightIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'
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
      <ArrowRightIcon
        className="size-[0.75rem] shrink-0 text-[#5d5d5d] tab:size-[1.5rem]"
        aria-hidden
      />
    )}
    <div
      className={cn(
        'flex items-center rounded-full px-[0.4375rem] py-[0.375rem] tab:px-[1.25rem] tab:py-[0.75rem]',
        isActive ? 'bg-[#5d5d5d]' : 'bg-transparent',
      )}
    >
      <div className="flex size-[1.173rem] items-center justify-center rounded-full tab:size-[2.346rem]">
        <span
          className={cn(
            'text-[0.75rem] font-medium tab:text-[1.173rem]',
            isActive ? 'text-white' : 'text-[#5d5d5d]',
          )}
        >
          {index + 1}
        </span>
      </div>
      <span
        className={cn(
          'text-[0.75rem] font-bold leading-[1.5] whitespace-nowrap tab:text-[1rem]',
          isActive ? 'text-white' : 'text-[#5d5d5d]',
        )}
      >
        {label}
      </span>
    </div>
  </>
)

const StepIndicator = () => {
  const { steps, currentStepIndex } = useOnboarding()

  const visibleSteps = steps.filter((step) => step.id !== 'complete')
  const needsTwoRows = visibleSteps.length > 3
  const splitIndex = Math.ceil(visibleSteps.length / 2)

  if (needsTwoRows) {
    const firstRow = visibleSteps.slice(0, splitIndex)
    const secondRow = visibleSteps.slice(splitIndex)

    return (
      <div className="flex flex-col items-center gap-[0.1875rem] tab:flex-row tab:gap-0">
        {/* 모바일: 2줄 */}
        <div className="flex items-center tab:hidden">
          {firstRow.map((step, index) => (
            <StepItem
              key={step.id}
              label={step.label}
              index={index}
              isActive={index === currentStepIndex}
              showArrowBefore={index > 0}
            />
          ))}
          <ArrowRightIcon
            className="size-[0.75rem] shrink-0 text-[#5d5d5d]"
            aria-hidden
          />
        </div>
        <div className="flex items-center tab:hidden">
          {secondRow.map((step, rowIndex) => {
            const globalIndex = splitIndex + rowIndex
            return (
              <StepItem
                key={step.id}
                label={step.label}
                index={globalIndex}
                isActive={globalIndex === currentStepIndex}
                showArrowBefore={rowIndex > 0}
              />
            )
          })}
        </div>

        {/* 데스크탑: 1줄 */}
        <div className="hidden tab:flex tab:items-center">
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
      </div>
    )
  }

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

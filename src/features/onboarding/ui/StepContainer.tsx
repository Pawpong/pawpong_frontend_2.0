'use client'

import { cn } from '@/shared/lib/Cn'
import { StepLayout } from './StepLayout'
import { StepTitle } from './StepTitle'
import { StepIndicator } from './StepIndicator'
import { StepNavButtons } from './StepNavButtons'

interface StepContainerProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  layoutClassName?: string
  navClassName?: string
  navExtraButtons?: React.ReactNode
}

const StepContainer = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel,
  nextDisabled,
  layoutClassName,
  navClassName,
  navExtraButtons,
}: StepContainerProps) => (
  <StepLayout className={layoutClassName}>
    <StepTitle subtitle={subtitle}>{title}</StepTitle>

    <div className="mt-[1.125rem] tab:mt-[2.09rem]">
      <StepIndicator />
    </div>

    {children}

    <StepNavButtons
      onNext={onNext}
      onBack={onBack}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
      className={navClassName}
      extraButtons={navExtraButtons}
    />
  </StepLayout>
)

export { StepContainer }
export type { StepContainerProps }

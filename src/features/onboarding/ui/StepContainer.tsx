'use client'

import { cn } from '@/shared/lib/cn'
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

    <div className="flex w-full max-w-[40.625rem] flex-col items-center gap-8 px-4 py-12 tab:gap-[3.625rem] tab:px-0 tab:py-12">
      <StepIndicator />
      {children}
    </div>

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

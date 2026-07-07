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
  <StepLayout className={cn('w-full flex-1', layoutClassName)}>
    <StepTitle subtitle={subtitle}>{title}</StepTitle>

    {/* tab+: flex-1로 남는 공간 채워 nav를 바닥에 붙임. 모바일: nav가 fixed라 flex-1 불필요 →
        자연 높이 + pb로 fixed nav 가림 방지(내용이 뷰포트보다 커도 잘리지 않고 페이지 스크롤) */}
    <div className="flex w-full max-w-[40.625rem] flex-col items-center gap-8 px-4 pt-12 pb-[7rem] tab:min-h-0 tab:flex-1 tab:gap-[3.625rem] tab:px-0 tab:py-12">
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

'use client'

import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
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
  backLabel?: string
  nextDisabled?: boolean
  /** 검증 실패 등 nav 버튼 위 에러 메시지 */
  navError?: string
  /** 본문 여백 오버라이드 — 폭은 STEP_LAYOUT.content 로 통일돼 있다 */
  contentClassName?: string
  navExtraButtons?: React.ReactNode
}

const StepContainer = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel,
  backLabel,
  nextDisabled,
  navError,
  contentClassName,
  navExtraButtons,
}: StepContainerProps) => (
  <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pt-6 tab:px-10 tab:pt-10">
    <StepIndicator />
    <StepTitle subtitle={subtitle}>{title}</StepTitle>
    <div
      className={cn(
        'mb-8 flex w-full flex-col items-center bg-base-white',
        STEP_LAYOUT.blockGap,
        contentClassName,
      )}
    >
      {children}
    </div>
    <StepNavButtons
      onNext={onNext}
      onBack={onBack}
      nextLabel={nextLabel}
      backLabel={backLabel}
      nextDisabled={nextDisabled}
      error={navError}
      extraButtons={navExtraButtons}
    />
  </div>
)

export { StepContainer }
export type { StepContainerProps }

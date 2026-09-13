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
  layoutClassName?: string
  /** 본문 여백 오버라이드 — 폭은 STEP_LAYOUT.content 로 통일돼 있다 */
  contentClassName?: string
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
  backLabel,
  nextDisabled,
  navError,
  layoutClassName,
  contentClassName,
  navClassName,
  navExtraButtons,
}: StepContainerProps) => (
  <div className={cn('flex w-full flex-1 flex-col items-center', layoutClassName)}>
    <StepTitle subtitle={subtitle}>{title}</StepTitle>

    {/* tab+: flex-1로 남는 공간 채워 nav를 바닥에 붙임. 모바일: nav가 fixed라 flex-1 불필요 →
        자연 높이 + pb로 fixed nav 가림 방지(내용이 뷰포트보다 커도 잘리지 않고 페이지 스크롤) */}
    <div
      className={cn(
        'flex flex-col items-center px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] tab:min-h-0 tab:flex-1 tab:px-0 tab:pt-6 tab:pb-12',
        STEP_LAYOUT.content,
        STEP_LAYOUT.blockGap,
        contentClassName,
      )}
    >
      <StepIndicator />
      {children}
    </div>

    <StepNavButtons
      onNext={onNext}
      onBack={onBack}
      nextLabel={nextLabel}
      backLabel={backLabel}
      nextDisabled={nextDisabled}
      error={navError}
      className={navClassName}
      extraButtons={navExtraButtons}
    />
  </div>
)

export { StepContainer }
export type { StepContainerProps }

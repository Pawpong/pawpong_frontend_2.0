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
  backLabel?: string
  nextDisabled?: boolean
  /** 검증 실패 등 nav 버튼 위 에러 메시지 */
  navError?: string
  layoutClassName?: string
  /** 본문 폭/여백 오버라이드 (기본 650px 보다 넓은 단계용) */
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
  <StepLayout className={cn('w-full flex-1', layoutClassName)}>
    <StepTitle subtitle={subtitle}>{title}</StepTitle>

    {/* tab+: flex-1로 남는 공간 채워 nav를 바닥에 붙임. 모바일: nav가 fixed라 flex-1 불필요 →
        자연 높이 + pb로 fixed nav 가림 방지(내용이 뷰포트보다 커도 잘리지 않고 페이지 스크롤) */}
    <div
      className={cn(
        'flex w-full max-w-[40.625rem] flex-col items-center gap-8 px-4 pt-12 pb-[7rem] tab:min-h-0 tab:flex-1 tab:gap-[3.625rem] tab:px-0 tab:pt-7 tab:pb-12',
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
  </StepLayout>
)

export { StepContainer }
export type { StepContainerProps }

import { Button, HelpMessage } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface StepNavButtonsProps {
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
  /** 검증 실패 등 버튼 위에 노출할 에러 메시지 */
  error?: string
  className?: string
  extraButtons?: React.ReactNode
}

const StepNavButtons = ({
  onNext,
  onBack,
  nextLabel = '다음',
  backLabel = '이전 단계',
  nextDisabled = false,
  error,
  className,
  extraButtons,
}: StepNavButtonsProps) => (
  <div
    className={cn(
      'sticky bottom-0 z-sticky mt-auto flex w-full shrink-0 flex-col items-center gap-4 bg-base-white pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]',
      className,
    )}
  >
    {error && (
      <HelpMessage status="error" className="justify-center">
        {error}
      </HelpMessage>
    )}
    {onNext && (
      <div className="flex w-full tab:max-w-sm">
        <Button onClick={onNext} disabled={nextDisabled} size="lg" width="full">
          {nextLabel}
        </Button>
      </div>
    )}
    {extraButtons}
    {onBack && (
      // txt btn(966-11657): 16px medium (px-1=4px 는 variant 기본값)
      <Button intent="ghost" onClick={onBack} size="inline">
        {backLabel}
      </Button>
    )}
  </div>
)

export { StepNavButtons }

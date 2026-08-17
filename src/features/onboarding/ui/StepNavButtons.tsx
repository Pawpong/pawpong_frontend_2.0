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
  backLabel = '뒤로',
  nextDisabled = false,
  error,
  className,
  extraButtons,
}: StepNavButtonsProps) => (
  <div
    className={cn(
      // tab+ 레이아웃: Figma BtnLayout(966-11668) — gap 8 / py 12 / px 48·80
      'fixed right-0 bottom-0 left-0 z-10 flex flex-col items-center gap-3 bg-white px-4 py-4 tab:static tab:right-auto tab:bottom-auto tab:left-auto tab:z-auto tab:gap-2 tab:px-12 tab:py-3 pc:px-20',
      className,
    )}
  >
    {error && (
      <HelpMessage status="error" className="justify-center">
        {error}
      </HelpMessage>
    )}
    {onNext && (
      <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        disabled={nextDisabled}
        // Figma BaseButton(966-11656): tab+ 258x40 / 16px. mo 는 기존 48 높이 유지
        className="w-full max-w-[18.5625rem] tab:h-10 tab:w-[16.125rem]"
      >
        {nextLabel}
      </Button>
    )}
    {extraButtons}
    {onBack && (
      // txt btn(966-11657): 16px medium (px-1=4px 는 variant 기본값)
      <Button variant="text" onClick={onBack} className="text-base font-medium">
        {backLabel}
      </Button>
    )}
  </div>
)

export { StepNavButtons }

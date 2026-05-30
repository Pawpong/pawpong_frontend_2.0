import { cn } from '@/shared/lib/Cn'

interface StepNavButtonsProps {
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
  className?: string
  extraButtons?: React.ReactNode
}

const StepNavButtons = ({
  onNext,
  onBack,
  nextLabel = '다음',
  backLabel = '뒤로',
  nextDisabled = false,
  className,
  extraButtons,
}: StepNavButtonsProps) => (
  <div
    className={cn(
      'fixed right-0 bottom-0 left-0 z-10 flex flex-col items-center gap-5 bg-white p-5 tab:static tab:right-auto tab:bottom-auto tab:left-auto tab:z-auto tab:py-8',
      className,
    )}
  >
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="h-12 w-full rounded-full bg-[#fffa94] text-base font-semibold text-[#3e3e3e] transition-colors disabled:opacity-40 tab:w-[16.125rem]"
      >
        {nextLabel}
      </button>
    )}
    {extraButtons}
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        className="text-base font-medium text-[#3e3e3e]"
      >
        {backLabel}
      </button>
    )}
  </div>
)

export { StepNavButtons }

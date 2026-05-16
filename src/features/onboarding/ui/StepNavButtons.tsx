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
      'fixed bottom-0 left-0 right-0 z-10 flex flex-col gap-[0.625rem] p-[1.25rem] tab:static tab:bottom-auto tab:left-auto tab:right-auto tab:z-auto tab:w-[31.4375rem] tab:gap-[0.875rem] tab:p-0 tab:pb-[2rem]',
      className,
    )}
  >
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        className="order-first h-[3rem] w-full rounded-full text-[1rem] font-semibold text-[#5d5d5d] tab:order-last"
      >
        {backLabel}
      </button>
    )}
    {extraButtons}
    {onNext && (
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="h-[3rem] w-full rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] transition-colors disabled:opacity-50"
      >
        {nextLabel}
      </button>
    )}
  </div>
)

export { StepNavButtons }

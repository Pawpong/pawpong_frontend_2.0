import { cn } from '@/shared/lib/cn'

const StepActionButton = ({
  className,
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    disabled={disabled}
    {...props}
    className={cn(
      'h-10 w-[6.25rem] shrink-0 rounded-lg px-2 text-base font-semibold',
      disabled ? 'bg-neutral-150 text-neutral-400' : 'bg-neutral-850 text-neutral-50',
      className,
    )}
  >
    {children}
  </button>
)

export { StepActionButton }

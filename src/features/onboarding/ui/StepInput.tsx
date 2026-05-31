import { cn } from '@/shared/lib/cn'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

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
      disabled ? 'bg-[#e4e4e4] text-[#b8b8b8]' : 'bg-[#3e3e3e] text-[#f6f6f6]',
      className,
    )}
  >
    {children}
  </button>
)

interface StepSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

const StepSelect = ({ value, onValueChange, options, placeholder, className }: StepSelectProps) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger
      className={cn(
        'h-[2.8125rem] w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-[0.875rem] leading-[1.5] font-medium text-[#3e3e3e] shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0',
        className,
      )}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export { StepActionButton, StepSelect }

import { forwardRef } from 'react'
import { cn } from '@/shared/lib/Cn'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

interface StepFieldLabelProps {
  label: string
  required?: boolean
}

const StepFieldLabel = ({ label, required }: StepFieldLabelProps) => (
  <div className="mb-[0.125rem] flex items-center gap-1">
    <span className="text-[0.875rem] font-semibold leading-[1.5] text-[#3e3e3e]">{label}</span>
    {required && (
      <span className="text-[0.875rem] font-medium leading-[1.5] text-[#6b6b6b]">필수</span>
    )}
  </div>
)

type StepInputProps = React.InputHTMLAttributes<HTMLInputElement>

const StepInput = forwardRef<HTMLInputElement, StepInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={cn(
      'h-[2.5rem] w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6] tab:h-[2.8125rem]',
      className,
    )}
  />
))
StepInput.displayName = 'StepInput'

type StepTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const StepTextarea = forwardRef<HTMLTextAreaElement, StepTextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        'h-[4.5rem] w-full resize-none rounded-lg border border-[#e4e4e4] bg-white px-3 py-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6] tab:h-[7.8125rem]',
        className,
      )}
    />
  ),
)
StepTextarea.displayName = 'StepTextarea'

const StepActionButton = ({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    className={cn(
      'h-10 shrink-0 rounded-lg bg-[#3e3e3e] px-2 text-base font-semibold text-[#f6f6f6] tab:w-[6.25rem]',
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
        'h-[2.5rem] w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 tab:h-[2.8125rem]',
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

export { StepFieldLabel, StepInput, StepTextarea, StepActionButton, StepSelect }

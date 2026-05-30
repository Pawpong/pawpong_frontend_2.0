import { forwardRef } from 'react'
import { cn } from '@/shared/lib/Cn'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

interface StepFieldLabelProps {
  label: string
  required?: boolean
  optional?: boolean
  className?: string
}

const StepFieldLabel = ({ label, required, optional, className }: StepFieldLabelProps) => (
  <div className={cn('flex items-center gap-1', className)}>
    <p className="p-[0.125rem] text-[0.875rem] font-semibold leading-[1.5] text-[#3e3e3e] tab:text-base">
      {label}
    </p>
    {required && (
      <span className="shrink-0 p-[0.125rem] text-[0.875rem] font-medium leading-[1.5] text-[#6b6b6b]">
        필수
      </span>
    )}
    {optional && (
      <span className="shrink-0 p-[0.125rem] text-[0.875rem] font-medium leading-[1.5] text-[#6b6b6b]">
        선택
      </span>
    )}
  </div>
)

type StepInputProps = React.InputHTMLAttributes<HTMLInputElement>

const StepInput = forwardRef<HTMLInputElement, StepInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={cn(
      'h-[2.8125rem] w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6]',
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
        'h-[4.5rem] w-full resize-none rounded-lg border border-[#cacaca] bg-white p-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] outline-none placeholder:text-[#a6a6a6] tab:h-[6.5625rem]',
        className,
      )}
    />
  ),
)
StepTextarea.displayName = 'StepTextarea'

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
      disabled
        ? 'bg-[#e4e4e4] text-[#b8b8b8]'
        : 'bg-[#3e3e3e] text-[#f6f6f6]',
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
        'h-[2.8125rem] w-full rounded-lg border border-[#e4e4e4] bg-white px-3 text-[0.875rem] font-medium leading-[1.5] text-[#3e3e3e] shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0',
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

interface StepTextareaWithCounterProps extends StepTextareaProps {
  currentLength: number
  maxLength: number
}

const StepTextareaWithCounter = forwardRef<HTMLTextAreaElement, StepTextareaWithCounterProps>(
  ({ currentLength, maxLength, ...props }, ref) => (
    <div className="flex flex-col gap-[0.125rem]">
      <StepTextarea ref={ref} maxLength={maxLength} {...props} />
      <p className="text-end text-[0.625rem] font-medium leading-[1.5] text-[#6b6b6b]">
        {currentLength}/{maxLength}
      </p>
    </div>
  ),
)
StepTextareaWithCounter.displayName = 'StepTextareaWithCounter'

export { StepFieldLabel, StepInput, StepTextarea, StepTextareaWithCounter, StepActionButton, StepSelect }

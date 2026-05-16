import { forwardRef } from 'react'
import { cn } from '@/shared/lib/Cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

type StepInputProps = React.InputHTMLAttributes<HTMLInputElement>

const StepInput = forwardRef<HTMLInputElement, StepInputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={cn(
      'h-[2.5rem] w-full rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]',
      className,
    )}
  />
))
StepInput.displayName = 'StepInput'

type StepTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const StepTextarea = forwardRef<HTMLTextAreaElement, StepTextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={cn(
      'h-[4.5rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[7.8125rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]',
      className,
    )}
  />
))
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
      'h-[2.5rem] shrink-0 rounded-[0.375rem] bg-[#a8a8a8] p-[0.625rem] text-[0.875rem] font-medium text-white tab:h-[3rem] tab:w-[12.5625rem] tab:rounded-full tab:bg-[#d4d4d4] tab:px-[0.625rem] tab:text-[1rem] tab:font-semibold tab:text-[#5d5d5d]',
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
        'h-[2.5rem] w-full rounded-[0.375rem] border border-[#a8a8a8] bg-white px-[0.625rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] shadow-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 tab:h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]',
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

export { StepInput, StepTextarea, StepActionButton, StepSelect }

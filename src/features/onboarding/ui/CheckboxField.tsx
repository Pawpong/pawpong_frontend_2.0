import { Checkbox, DetailLink } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import { CHECKBOX_CLASS } from './constants'

interface CheckboxFieldProps {
  label: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  hasDetailLink?: boolean
  className?: string
}

const CheckboxField = ({
  label,
  checked,
  onCheckedChange,
  hasDetailLink,
  className,
}: CheckboxFieldProps) => (
  <label className={cn('flex cursor-pointer items-center gap-3', className)}>
    <Checkbox
      checked={!!checked}
      onCheckedChange={(v) => onCheckedChange(v as boolean)}
      className={CHECKBOX_CLASS}
    />
    <span className="flex-1 text-base font-medium leading-[1.5] text-[#3e3e3e]">{label}</span>
    {hasDetailLink && <DetailLink variant="button" size="lg" />}
  </label>
)

export { CheckboxField }
export type { CheckboxFieldProps }

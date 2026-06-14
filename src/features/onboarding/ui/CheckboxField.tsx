import { Checkbox, DetailLink } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

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
    {/* [refactored] 불필요한 !! 코어션 + as boolean 단언 제거 (checked는 이미 boolean, v는 === true로 판정) */}
    <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
    <span className="flex-1 text-base leading-[1.5] font-medium text-[#3e3e3e]">{label}</span>
    {hasDetailLink && <DetailLink variant="button" size="lg" />}
  </label>
)

export { CheckboxField }
export type { CheckboxFieldProps }

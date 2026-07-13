import { Checkbox, DetailLink, TextLabel } from '@/shared/ui'
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
  <label className={cn('flex cursor-pointer items-center', className)}>
    {/* [refactored] 불필요한 !! 코어션 + as boolean 단언 제거 (checked는 이미 boolean, v는 === true로 판정) */}
    <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
    <TextLabel size="16" weight="medium" className="flex-1">
      {label}
    </TextLabel>
    {hasDetailLink && <DetailLink variant="button" size="lg" label="자세히" />}
  </label>
)

export { CheckboxField }
export type { CheckboxFieldProps }

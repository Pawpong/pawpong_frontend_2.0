import { Checkbox, DetailLink, TextLabel } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface CheckboxFieldProps {
  label: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  hasDetailLink?: boolean
  /** "자세히" 클릭 — label 안에 있어 기본 동작(체크 토글)은 막고 호출 */
  onDetailClick?: () => void
  className?: string
}

const CheckboxField = ({
  label,
  checked,
  onCheckedChange,
  hasDetailLink,
  onDetailClick,
  className,
}: CheckboxFieldProps) => (
  <label className={cn('flex cursor-pointer items-center', className)}>
    {/* [refactored] 불필요한 !! 코어션 + as boolean 단언 제거 (checked는 이미 boolean, v는 === true로 판정) */}
    {/* Checkbox size 도 고정값(large=32px 고정)이라 모바일은 한 단계 작게(24px) 오버라이드 */}
    <Checkbox
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className="size-6 tab:size-8"
    />
    {/* TextLabel·DetailLink 의 size 는 고정값(반응형 아님) — 이 화면은 모바일에서 한 단계
        작게 시작해 tab+ 에서 커지도록 직접 오버라이드한다 */}
    <TextLabel size="16" weight="medium" className="flex-1 text-sm tab:text-base">
      {label}
    </TextLabel>
    {hasDetailLink && (
      <DetailLink
        variant="button"
        size="lg"
        label="자세히"
        className="text-sm tab:text-base"
        onClick={(e) => {
          e.preventDefault()
          onDetailClick?.()
        }}
      />
    )}
  </label>
)

export { CheckboxField }
export type { CheckboxFieldProps }

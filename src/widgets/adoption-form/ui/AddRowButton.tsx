import { PlusIcon } from '@/shared/assets'
import { Button } from '@/shared/ui'

interface AddRowButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

/** 작성란/부모정보 추가 버튼 (Figma FillButton 3137-387118) — h-32 radius 8, 아이콘 16 + 14/bold */
const AddRowButton = ({ label, onClick, disabled }: AddRowButtonProps) => (
  <Button variant="fill" size="sm" onClick={onClick} disabled={disabled} className="w-full">
    <PlusIcon className="size-4" />
    {label}
  </Button>
)

interface RemoveRowButtonProps {
  label: string
  onClick: () => void
  /** 행이 하나뿐이면 지울 수 없다 — 호출부의 `fields.length > 1` 판정을 여기로 모았다 */
  visible: boolean
}

// [refactored] 접종·유전병·부모 세 곳에서 같던 행 삭제 버튼
const RemoveRowButton = ({ label, onClick, visible }: RemoveRowButtonProps) =>
  visible ? (
    <Button
      variant="text"
      onClick={onClick}
      aria-label={label}
      className="min-h-11 self-end px-2 text-error-500 hover:bg-error-50 active:bg-error-50"
    >
      삭제
    </Button>
  ) : null

export { AddRowButton, RemoveRowButton }

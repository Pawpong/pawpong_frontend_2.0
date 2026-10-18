'use client'

import { MoreVertIcon } from '@/shared/assets'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu'
import { IconButton } from './IconButton'

interface OwnerActionsMenuProps {
  /** 수정 기능을 제공하는 화면에서만 수정 항목을 노출한다. */
  onEdit?: () => void
  onDelete: () => void
  /** 트리거의 구체적인 접근성 이름 */
  ariaLabel?: string
  triggerId?: string
  disabled?: boolean
}

/**
 * 본인 소유 게시글/댓글의 ⋮ 더보기 메뉴.
 * onEdit을 생략하면 삭제 항목만 노출한다.
 * 소유자 판정은 호출부에서 하고, 이 컴포넌트는 렌더된 시점에 항상 표시한다.
 */
const OwnerActionsMenu = ({
  onEdit,
  onDelete,
  ariaLabel = '더보기',
  triggerId,
  disabled,
}: OwnerActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <IconButton edge="both" aria-label={ariaLabel} id={triggerId} disabled={disabled}>
        <MoreVertIcon className="size-6" />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {onEdit && <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>}
      <DropdownMenuItem onSelect={onDelete} className="text-error-500 focus:text-error-600">
        삭제
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export { OwnerActionsMenu }

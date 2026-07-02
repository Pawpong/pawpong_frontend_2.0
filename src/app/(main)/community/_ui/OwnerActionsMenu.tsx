'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'
import { MoreVertIcon } from '@/shared/assets/icons'

interface OwnerActionsMenuProps {
  onEdit: () => void
  onDelete: () => void
  /** 트리거 아이콘 크기 (기본 size-6) */
  className?: string
}

/**
 * 본인 소유 게시글/댓글의 ⋮ 더보기 메뉴 (수정/삭제).
 * 소유자 판정은 호출부에서 하고, 이 컴포넌트는 렌더된 시점에 항상 표시한다.
 */
const OwnerActionsMenu = ({ onEdit, onDelete, className }: OwnerActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" aria-label="더보기" className={className}>
        <MoreVertIcon className="size-6 text-text-primary" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>
      <DropdownMenuItem onSelect={onDelete} className="text-red-500 focus:text-red-500">
        삭제
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export { OwnerActionsMenu }

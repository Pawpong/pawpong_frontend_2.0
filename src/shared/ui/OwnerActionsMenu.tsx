'use client'

import { MoreVertIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu'

interface OwnerActionsMenuProps {
  /** 수정 기능을 제공하는 화면에서만 수정 항목을 노출한다. */
  onEdit?: () => void
  onDelete: () => void
  /** 트리거 아이콘 크기 (기본 size-6) */
  className?: string
  /** 트리거의 구체적인 접근성 이름 */
  ariaLabel?: string
}

/**
 * 본인 소유 게시글/댓글의 ⋮ 더보기 메뉴.
 * onEdit을 생략하면 삭제 항목만 노출한다.
 * 소유자 판정은 호출부에서 하고, 이 컴포넌트는 렌더된 시점에 항상 표시한다.
 */
const OwnerActionsMenu = ({
  onEdit,
  onDelete,
  className,
  ariaLabel = '더보기',
}: OwnerActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          'text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          className,
        )}
      >
        <MoreVertIcon className="size-6" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {onEdit && <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>}
      <DropdownMenuItem onSelect={onDelete} className="text-red-500 focus:text-red-500">
        삭제
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export { OwnerActionsMenu }

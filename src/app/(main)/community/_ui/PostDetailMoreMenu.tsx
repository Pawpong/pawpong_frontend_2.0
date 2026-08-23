'use client'

import { MoreVertIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui'

interface PostDetailMoreMenuProps {
  onEdit: () => void
  onDelete: () => void
  className?: string
}

/**
 * 최은진: 신규 파일 — shared/ui의 OwnerActionsMenu를 대체하는 커뮤니티 상세 전용 더보기 메뉴.
 * shared/ui가 다른 화면 사정으로 바뀌어도 피드 상세(게시글·댓글)는 영향받지 않도록,
 * CommunityFeedCard/CommunityAvatar와 같은 원칙으로 트리거 버튼 마크업을 로컬로 뒀다.
 * 드롭다운 여닫힘·포지셔닝 같은 동작(Radix DropdownMenu)과 디자인시스템 팝업 껍데기는
 * 앱 전체가 공유하는 인프라라 그대로 재사용한다 — Figma feed-detail 컴포넌트도 열린
 * 드롭다운 상태 자체를 그리지 않는다.
 */
const PostDetailMoreMenu = ({ onEdit, onDelete, className }: PostDetailMoreMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button type="button" aria-label="더보기" className={cn('text-text-primary', className)}>
        <MoreVertIcon className="size-6" />
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

export { PostDetailMoreMenu }

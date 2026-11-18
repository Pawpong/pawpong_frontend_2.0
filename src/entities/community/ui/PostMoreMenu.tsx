'use client'

import { useState } from 'react'
import { MoreVertIcon } from '@/shared/assets'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  ShareModal,
  type ShareButtonProps,
} from '@/shared/ui'

interface PostMoreMenuProps {
  saved: boolean
  orientation?: 'vertical' | 'horizontal'
  /** 없으면 저장 항목을 숨긴다 (보류 글 등) */
  onToggleSave?: () => void
  /** 있으면 공유 항목을 보여준다 — 공개·게시 상태인 글에만 넘긴다 */
  share?: ShareButtonProps
  /** 내 글일 때만 */
  onEdit?: () => void
  onDelete?: () => void
  /** 남의 글일 때만 — 신고 다이얼로그는 features 에서 메뉴 바깥에 둔다 */
  onReport?: () => void
}

const DANGER_ITEM = 'text-error-500 focus:text-error-600'

/** 게시글 ⋮ 메뉴 — 저장·공유와 내 글(수정·삭제) 또는 남의 글(신고) 항목을 한곳에 모은다. */
const PostMoreMenu = ({
  saved,
  orientation = 'vertical',
  onToggleSave,
  share,
  onEdit,
  onDelete,
  onReport,
}: PostMoreMenuProps) => {
  const [shareOpen, setShareOpen] = useState(false)

  if (!onToggleSave && !share && !onEdit && !onDelete && !onReport) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton size="touch" tone="brand" aria-label="게시글 더보기">
            <MoreVertIcon
              className={orientation === 'horizontal' ? 'size-6 rotate-90' : 'size-6'}
            />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onToggleSave && (
            <DropdownMenuItem onSelect={onToggleSave}>
              {saved ? '저장 취소' : '저장하기'}
            </DropdownMenuItem>
          )}
          {share && (
            <DropdownMenuItem onSelect={() => setShareOpen(true)}>공유하기</DropdownMenuItem>
          )}
          {onEdit && <DropdownMenuItem onSelect={onEdit}>수정</DropdownMenuItem>}
          {onDelete && (
            <DropdownMenuItem onSelect={onDelete} className={DANGER_ITEM}>
              삭제
            </DropdownMenuItem>
          )}
          {onReport && (
            <DropdownMenuItem onSelect={onReport} className={DANGER_ITEM}>
              신고
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {share && <ShareModal open={shareOpen} onOpenChange={setShareOpen} {...share} />}
    </>
  )
}

export { PostMoreMenu }

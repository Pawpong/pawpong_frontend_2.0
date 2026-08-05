'use client'

import { useState } from 'react'
import { FavoriteButton, ShareModal } from '@/shared/ui'
import { ShareIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface FavoriteShareActionsProps {
  isFavorite?: boolean
  onToggle?: () => void
  // 피그마 Frame1707484443 like/share 토글 — pc는 둘 다, 모바일·탭 하단은 공유만(showFavorite=false)
  showFavorite?: boolean
  showShare?: boolean
  className?: string
}

// [refactored] 피그마 Frame1707484443 (관심있어요 + 공유) — 히어로/리스트 카드 공통 액션 행
// 아이콘 32, 아이콘↔텍스트 gap-0, 텍스트 12px semibold #3e3e3e, 행 gap-16
const FavoriteShareActions = ({
  isFavorite,
  onToggle,
  showFavorite = true,
  showShare = true,
  className,
}: FavoriteShareActionsProps) => {
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className={cn('flex items-center gap-[1rem]', className)}>
      {showFavorite && (
        <FavoriteButton
          size="lg"
          className="gap-0 p-0 text-[0.75rem] font-semibold text-neutral-850"
          iconClassName="size-[2rem]"
          isFavorite={isFavorite}
          onToggle={onToggle}
        />
      )}
      {showShare && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-0 text-[0.75rem] font-semibold text-neutral-850"
        >
          <ShareIcon className="size-[2rem]" />
          <span>공유</span>
        </button>
      )}
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  )
}

export { FavoriteShareActions }

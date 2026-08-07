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
  // 라벨 스타일 — 모바일은 아이콘만, 탭+는 라벨 노출이라 boolean이 아닌 반응형 클래스로 제어
  // (피그마 모바일 1943:112830 라벨 없음 / 탭 1654:148613 라벨 12px neutral-700)
  labelClassName?: string
  // 공유 모달 메타 (카카오/OS 공유용) — 없으면 현재 페이지 URL·title 기본값
  shareTitle?: string
  shareDescription?: string
  shareImageUrl?: string
  className?: string
}

// [refactored] 피그마 Frame1707484443 (관심있어요 + 공유) — 히어로/리스트 카드 공통 액션 행
// 아이콘 32, 아이콘↔텍스트 gap-0, 텍스트 12px semibold #3e3e3e, 행 gap-16
const FavoriteShareActions = ({
  isFavorite,
  onToggle,
  showFavorite = true,
  showShare = true,
  labelClassName,
  shareTitle,
  shareDescription,
  shareImageUrl,
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
          labelClassName={labelClassName}
          isFavorite={isFavorite}
          onToggle={onToggle}
        />
      )}
      {showShare && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          aria-label="공유"
          className="flex items-center gap-0 text-[0.75rem] font-semibold text-neutral-850"
        >
          <ShareIcon className="size-[2rem] text-neutral-700" />
          <span className={labelClassName}>공유</span>
        </button>
      )}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={shareTitle}
        description={shareDescription}
        imageUrl={shareImageUrl}
      />
    </div>
  )
}

export { FavoriteShareActions }

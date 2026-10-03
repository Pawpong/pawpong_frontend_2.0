'use client'

import { useState } from 'react'
import { ShareModal, ToggleIconButton } from '@/shared/ui'
import { FavoriteIcon, ShareIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface FavoriteShareActionsProps {
  isFavorite?: boolean
  onToggle?: () => void
  // 피그마 Frame1707484443 like/share 토글 — 화면별 중복 액션은 showFavorite/className으로 제어한다.
  showFavorite?: boolean
  showShare?: boolean
  // 라벨 스타일 — 모바일은 아이콘만, 탭+는 라벨 노출이라 boolean이 아닌 반응형 클래스로 제어
  // (피그마 모바일 1943:112830 라벨 없음 / 탭 1654:148613 라벨 12px neutral-700)
  labelVisibility?: 'always' | 'tablet'
  // 공유 모달 메타 (카카오/OS 공유용) — 없으면 현재 페이지 URL·title 기본값
  shareUrl?: string
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
  labelVisibility,
  shareUrl,
  shareTitle,
  shareDescription,
  shareImageUrl,
  className,
}: FavoriteShareActionsProps) => {
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className={cn('flex items-center gap-[1rem]', className)}>
      {showFavorite && (
        <ToggleIconButton
          icon={FavoriteIcon}
          hasFillState
          size="md"
          label="관심있어요"
          labelVisibility={labelVisibility}
          pressed={isFavorite}
          onClick={onToggle}
        />
      )}
      {showShare && (
        <ToggleIconButton
          icon={ShareIcon}
          size="md"
          label="공유"
          labelVisibility={labelVisibility}
          aria-label="공유"
          onClick={() => setShareOpen(true)}
        />
      )}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        url={shareUrl}
        title={shareTitle}
        description={shareDescription}
        imageUrl={shareImageUrl}
      />
    </div>
  )
}

export { FavoriteShareActions }

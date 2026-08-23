'use client'

import { type MouseEvent, type SVGProps } from 'react'
import { cn } from '@/shared/lib/cn'
import { FavoriteIcon } from '@/shared/assets'

// Figma icon/heart press 상태 — 관심 #ff8181 / 기본 #a6a6a6.
// 모든 하트(FavoriteToggle·FavoriteButton·PostActionButton)가 참조하는 단일 색 정의.
export const FAVORITE_ACTIVE = 'text-[#ff8181]'
export const FAVORITE_INACTIVE = 'text-neutral-500'

interface FavoriteHeartProps extends SVGProps<SVGSVGElement> {
  isFavorite?: boolean
}

/** 하트 아이콘 — isFavorite에 따라 경로와 색을 전환한다. 클릭/래핑은 상위가 담당. */
export const FavoriteHeart = ({ isFavorite = false, className, ...props }: FavoriteHeartProps) => (
  <FavoriteIcon
    status={isFavorite ? 'fill' : 'default'}
    className={cn(className, isFavorite ? FAVORITE_ACTIVE : FAVORITE_INACTIVE)}
    {...props}
  />
)

interface FavoriteToggleProps {
  isFavorite?: boolean
  /** 클릭 시 토글 — 카드 Link 내부여도 preventDefault로 네비게이션 방지 */
  onToggle?: () => void
  /** 버튼 위치/래핑 스타일 (예: absolute 오버레이) */
  className?: string
  /** 하트 크기 (기본 24px) */
  iconClassName?: string
  ariaLabel?: string
}

/** 아이콘 전용 하트 토글 (라벨 없음). 라벨이 필요하면 FavoriteButton 사용. */
const FavoriteToggle = ({
  isFavorite = false,
  onToggle,
  className,
  iconClassName,
  ariaLabel = '관심 등록',
}: FavoriteToggleProps) => {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle?.()
  }

  return (
    <button type="button" onClick={handleClick} aria-label={ariaLabel} className={className}>
      <FavoriteHeart isFavorite={isFavorite} className={cn('size-6', iconClassName)} />
    </button>
  )
}

export { FavoriteToggle }

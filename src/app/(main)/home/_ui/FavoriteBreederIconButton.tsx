'use client'

import type { MouseEvent } from 'react'
import { PixelStarFillIcon, PixelStarOutlineIcon, ProfileStarIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { useAddFavorite, useRemoveFavorite } from '@/features/adopter'

interface FavoriteBreederIconButtonProps {
  breederId: string
  isFavorited: boolean
  size?: 'nav' | 'profile' | 'card'
  /** 미등록 아이콘 색 오버라이드 (이미지 위 카드에서는 흰색) */
  iconClassName?: string
  className?: string
}

// 박스 / 글리프 크기 (시안 icon/star: md 32+padding4 -> 24, lg 48+padding4 -> 40)
const SIZE = {
  nav: { box: 'size-10', icon: 'size-6' },
  profile: { box: 'size-12 p-1', icon: 'size-10' },
  card: { box: 'size-8 tab:size-12', icon: 'size-6 tab:size-10' },
} as const

/** 브리더 즐겨찾기 토글 — 프로필 상단은 별, 이미지 카드는 기존 픽셀 아이콘. */
const FavoriteBreederIconButton = ({
  breederId,
  isFavorited,
  size = 'profile',
  iconClassName,
  className,
}: FavoriteBreederIconButtonProps) => {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const isPending = addFavorite.isPending || removeFavorite.isPending
  const label = isFavorited ? '즐겨찾기 해제' : '즐겨찾기 등록'
  const Icon = isFavorited ? PixelStarFillIcon : PixelStarOutlineIcon

  // 카드 전체가 Link 라 이동을 막고 토글만 한다 (링크 밖에서는 무해)
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isPending) return
    const mutation = isFavorited ? removeFavorite : addFavorite
    mutation.mutate(breederId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      aria-pressed={isFavorited}
      aria-disabled={isPending}
      className={cn(
        'flex shrink-0 items-center justify-center',
        SIZE[size].box,
        size === 'nav' &&
          'rounded-lg text-primary-500 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        className,
      )}
    >
      {size === 'nav' ? (
        <ProfileStarIcon filled={isFavorited} className={cn(SIZE[size].icon, iconClassName)} />
      ) : (
        <Icon
          className={cn(SIZE[size].icon, !isFavorited && 'text-primary-500/60', iconClassName)}
        />
      )}
    </button>
  )
}

export { FavoriteBreederIconButton }

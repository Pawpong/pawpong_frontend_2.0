'use client'

import type { MouseEvent } from 'react'
import { PixelStarFillIcon, PixelStarOutlineIcon } from '@/shared/assets'
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
  nav: { box: 'size-6', icon: 'size-6' },
  profile: { box: 'size-12 p-1', icon: 'size-10' },
  card: { box: 'size-8 tab:size-12', icon: 'size-6 tab:size-10' },
} as const

/** 브리더 즐겨찾기 토글 — Figma의 다이아몬드형 pixel star 액션. */
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
      aria-pressed={isFavorited}
      aria-disabled={isPending}
      className={cn('flex shrink-0 items-center justify-center', SIZE[size].box, className)}
    >
      <Icon className={cn(SIZE[size].icon, !isFavorited && 'text-primary-500/60', iconClassName)} />
    </button>
  )
}

export { FavoriteBreederIconButton }

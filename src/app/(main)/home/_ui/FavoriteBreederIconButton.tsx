'use client'

import type { MouseEvent } from 'react'
import { ProfileStarIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { useAddFavorite, useRemoveFavorite } from '@/features/adopter'
import { IconButton } from '@/shared/ui'

interface FavoriteBreederIconButtonProps {
  breederId: string
  isFavorited: boolean
  size?: 'nav' | 'profile' | 'card'
  /** 미등록 아이콘 색 오버라이드 (이미지 위 카드에서는 흰색) */
  iconClassName?: string
}

// 버튼 틀은 IconButton, 글리프 크기만 여기서 (시안 icon/star: md 32 -> 24, lg 48 -> 40)
const SIZE = {
  nav: { button: { tone: 'brand', size: 'md' }, icon: 'size-6' },
  profile: { button: { tone: 'neutral', size: 'lg' }, icon: 'size-10' },
  card: { button: { tone: 'neutral', size: 'responsive' }, icon: 'size-6 tab:size-10' },
} as const

/** 브리더 즐겨찾기 토글 — 프로필 상단·이미지 카드 모두 같은 별(등록 시 point-500 채움). */
const FavoriteBreederIconButton = ({
  breederId,
  isFavorited,
  size = 'profile',
  iconClassName,
}: FavoriteBreederIconButtonProps) => {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const isPending = addFavorite.isPending || removeFavorite.isPending
  const label = isFavorited ? '즐겨찾기 해제' : '즐겨찾기 등록'

  // 카드 전체가 Link 라 이동을 막고 토글만 한다 (링크 밖에서는 무해)
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isPending) return
    const mutation = isFavorited ? removeFavorite : addFavorite
    mutation.mutate(breederId)
  }

  return (
    <IconButton
      {...SIZE[size].button}
      onClick={handleClick}
      aria-label={label}
      title={label}
      aria-pressed={isFavorited}
      aria-disabled={isPending}
    >
      <ProfileStarIcon filled={isFavorited} className={cn(SIZE[size].icon, iconClassName)} />
    </IconButton>
  )
}

export { FavoriteBreederIconButton }

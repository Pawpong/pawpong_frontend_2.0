'use client'

import type { MouseEvent } from 'react'
import { ProfileStarIcon } from '@/shared/assets'
import { useAddFavorite, useRemoveFavorite } from '@/features/adopter'
import { IconButton } from '@/shared/ui'

interface FavoriteBreederIconButtonProps {
  breederId: string
  isFavorited: boolean
  size?: 'nav' | 'profile' | 'card'
}

// 사진을 덜 가리도록 카드 버튼은 모든 화면에서 40px, 별은 24px로 유지한다.
const SIZE = {
  nav: 'md',
  profile: 'lg',
  card: 'md',
} as const

/** 브리더 즐겨찾기 — 크림색 빈 별에서 노란 바탕의 채운 픽셀 별로 전환한다. */
const FavoriteBreederIconButton = ({
  breederId,
  isFavorited,
  size = 'profile',
}: FavoriteBreederIconButtonProps) => {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const isPending = addFavorite.isPending || removeFavorite.isPending
  const label = isPending
    ? isFavorited
      ? '즐겨찾기 해제 중'
      : '즐겨찾기 등록 중'
    : isFavorited
      ? '즐겨찾기 해제'
      : '즐겨찾기 등록'

  // 카드의 상세 이동과 분리하고, 처리 중에는 키보드 포커스를 유지하면서 중복 요청을 막는다.
  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isPending) return
    const mutation = isFavorited ? removeFavorite : addFavorite
    mutation.mutate(breederId)
  }

  return (
    <IconButton
      tone="favorite"
      size={SIZE[size]}
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isFavorited}
      aria-disabled={isPending}
      aria-busy={isPending}
    >
      <ProfileStarIcon filled={isFavorited} className="size-6" />
    </IconButton>
  )
}

export { FavoriteBreederIconButton }

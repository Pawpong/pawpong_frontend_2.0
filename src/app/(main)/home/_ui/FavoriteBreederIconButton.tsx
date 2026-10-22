'use client'

import { useRef, type MouseEvent } from 'react'
import { ProfileStarIcon } from '@/shared/assets'
import { useAddFavorite, useRemoveFavorite } from '@/features/adopter'
import { IconButton } from '@/shared/ui'

interface FavoriteBreederIconButtonProps {
  breederId: string
  isFavorited: boolean
  size?: 'action' | 'profile' | 'card'
}

// 별 주변은 투명하게 유지하면서 누를 수 있는 영역은 최소 44px를 확보한다.
// action 은 프로필의 팔로우·메시지 옆 정사각 버튼 — 메시지 버튼과 같은 테두리·높이(h-10)로 한 줄을 이룬다.
const VARIANT = {
  action: { tone: 'outline', size: 'md', icon: 'size-6' },
  profile: { tone: 'favorite', size: 'lg', icon: 'size-7.5' },
  card: { tone: 'favorite', size: 'touch', icon: 'size-7.5' },
} as const

/** 브리더 즐겨찾기 — 빈 픽셀 별을 누르면 별 안쪽만 노랗게 채워진다. */
const FavoriteBreederIconButton = ({
  breederId,
  isFavorited,
  size = 'profile',
}: FavoriteBreederIconButtonProps) => {
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()
  const requestPending = useRef(false)
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
    if (isPending || requestPending.current) return
    requestPending.current = true
    const mutation = isFavorited ? removeFavorite : addFavorite
    // 화면을 떠나 mutation observer가 해제돼도 요청 잠금은 반드시 해제한다.
    void mutation
      .mutateAsync(breederId)
      .catch(() => undefined)
      .finally(() => {
        requestPending.current = false
      })
  }

  const variant = VARIANT[size]
  return (
    <IconButton
      tone={variant.tone}
      size={variant.size}
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isFavorited}
      aria-disabled={isPending}
      aria-busy={isPending}
    >
      <ProfileStarIcon filled={isFavorited} className={variant.icon} />
    </IconButton>
  )
}

export { FavoriteBreederIconButton }

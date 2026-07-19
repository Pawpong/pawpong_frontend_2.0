'use client'

import { type MouseEvent } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { FavoriteHeart, FAVORITE_ACTIVE } from './FavoriteToggle'

const favoriteButtonVariants = tv({
  base: 'flex items-center rounded-full font-medium text-[#5d5d5d]',
  variants: {
    size: {
      sm: 'text-[0.75rem]',
      md: 'p-[0.585rem] text-[0.819rem]',
      lg: 'p-[0.625rem] text-[0.875rem]',
    },
  },
  defaultVariants: { size: 'lg' },
})

const favoriteIconSize = {
  sm: 'size-[1.403rem]',
  md: 'size-[1.403rem]',
  lg: 'size-[1.5rem]',
} as const

interface FavoriteButtonProps extends VariantProps<typeof favoriteButtonVariants> {
  className?: string
  iconClassName?: string
  // 제어형: 관심 여부와 토글 콜백은 상위(카드)에서 mutation과 연결한다
  isFavorite?: boolean
  onToggle?: () => void
}

const FavoriteButton = ({
  size = 'lg',
  className,
  iconClassName,
  isFavorite = false,
  onToggle,
}: FavoriteButtonProps) => {
  // 카드 Link 내부에 있을 수 있으므로 클릭 시 네비게이션 방지 + 관심 토글
  const handleClick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      // 관심 시 하트+텍스트 모두 #FF8181
      className={cn(favoriteButtonVariants({ size }), className, isFavorite && FAVORITE_ACTIVE)}
    >
      <FavoriteHeart
        isFavorite={isFavorite}
        className={cn(favoriteIconSize[size ?? 'lg'], iconClassName)}
      />
      <span>관심있어요</span>
    </button>
  )
}

export { FavoriteButton, favoriteButtonVariants }

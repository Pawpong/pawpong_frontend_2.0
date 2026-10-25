'use client'

import type { MouseEventHandler } from 'react'
import { FavoriteIcon, PixelMessageIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { PhotoTile } from '@/shared/ui'
import type { CommunityPostReview } from '@/shared/types'
import { CommunityReviewLabel } from './CommunityReviewLabel'

interface CommunityMediaCardProps {
  aiReview?: CommunityPostReview
  href: string
  imageUrl?: string
  imageCount: number
  alt: string
  preload?: boolean
  variant?: 'showcase' | 'profileGrid'
  likeCount?: number
  commentCount?: number
  onClick?: MouseEventHandler<HTMLAnchorElement>
  className?: string
}

/**
 * 홈의 `동물 자랑하기` 전용 미디어 타일.
 *
 * Figma Community Feed Card-my home 규격을 따라 Mobile·Tablet은 122px,
 * PC는 300px 정사각형을 사용한다. 피드 본문·액션은 커뮤니티 메인 카드가
 * 소유하고, 홈에서는 사진과 장수만 보여 정보 밀도를 낮춘다.
 */
const CommunityMediaCard = ({
  href,
  aiReview,
  imageUrl,
  imageCount,
  alt,
  preload = false,
  variant = 'showcase',
  likeCount,
  commentCount,
  onClick,
  className,
}: CommunityMediaCardProps) => {
  const isProfileGrid = variant === 'profileGrid'
  return (
    <div
      className={cn(
        isProfileGrid ? 'w-full min-w-0' : 'w-[7.625rem] shrink-0 tab:w-full',
        className,
      )}
    >
      <PhotoTile
        href={href}
        imageUrl={imageUrl}
        alt={alt}
        count={imageCount}
        preload={preload}
        sizes={isProfileGrid ? '(max-width: 767px) 33vw, 25vw' : '(min-width: 768px) 20vw, 122px'}
        onClick={onClick}
        status={aiReview?.state === 'held' && <CommunityReviewLabel review={aiReview} />}
        hoverContent={
          isProfileGrid && (
            <>
              <span className="flex items-center gap-1">
                <FavoriteIcon className="size-6" />
                {likeCount ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <PixelMessageIcon className="size-6" />
                {commentCount ?? 0}
              </span>
            </>
          )
        }
      />
    </div>
  )
}

export { CommunityMediaCard }
export type { CommunityMediaCardProps }

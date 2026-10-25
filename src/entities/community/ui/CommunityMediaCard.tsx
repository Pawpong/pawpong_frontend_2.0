'use client'

import type { MouseEventHandler } from 'react'
import { FavoriteIcon, PixelMessageIcon } from '@/shared/assets'
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
}

/**
 * 홈 `동물 자랑하기`·마이홈 게시글 격자의 사진 타일.
 *
 * 피드 본문·액션은 커뮤니티 메인 카드가 소유하고, 여기서는 사진과 장수만 보여
 * 정보 밀도를 낮춘다. 마이홈 격자(profileGrid)만 PC 에서 좋아요·댓글 수를 덮어 보여준다.
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
}: CommunityMediaCardProps) => {
  const isProfileGrid = variant === 'profileGrid'
  // 폭은 목록(홈 가로 줄·마이홈 격자)이 정한다 — 카드는 칸을 가득 채우기만 한다
  return (
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
  )
}

export { CommunityMediaCard }
export type { CommunityMediaCardProps }

'use client'

import type { MouseEventHandler } from 'react'
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
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

/**
 * 홈 `동물 자랑하기` 가로 줄의 사진 타일.
 *
 * 피드 본문·액션은 커뮤니티 메인 카드가 소유하고, 여기서는 사진과 장수만 보여
 * 정보 밀도를 낮춘다. 프로필 홈 게시글은 1열 피드 카드(CommunityProfileFeedCard)를 쓴다.
 */
const CommunityMediaCard = ({
  href,
  aiReview,
  imageUrl,
  imageCount,
  alt,
  preload = false,
  onClick,
}: CommunityMediaCardProps) => (
  // 폭은 목록(홈 가로 줄)이 정한다 — 카드는 칸을 가득 채우기만 한다
  <PhotoTile
    href={href}
    imageUrl={imageUrl}
    alt={alt}
    count={imageCount}
    preload={preload}
    sizes="(min-width: 768px) 20vw, 122px"
    onClick={onClick}
    status={aiReview?.state === 'held' && <CommunityReviewLabel review={aiReview} />}
  />
)

export { CommunityMediaCard }
export type { CommunityMediaCardProps }

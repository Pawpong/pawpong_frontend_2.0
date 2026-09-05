'use client'

import { useState, type MouseEventHandler } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FavoriteIcon, PawIcon, PixelMessageIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface CommunityMediaCardProps {
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
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl
  const isProfileGrid = variant === 'profileGrid'

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      aria-label={`${alt} 게시글 보기`}
      className={cn(
        'group relative block shrink-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        isProfileGrid
          ? 'aspect-square w-full bg-neutral-700 pc:rounded-lg pc:border pc:border-neutral-300'
          : 'size-[7.625rem] rounded-lg border border-neutral-300 bg-point-50 transition-shadow duration-200 tab:aspect-square tab:size-auto tab:w-full pc:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      {showImage ? (
        <Image
          src={imageUrl!}
          alt=""
          fill
          sizes="(min-width: 768px) 20vw, 122px"
          loading={preload ? 'eager' : 'lazy'}
          fetchPriority={preload ? 'high' : 'auto'}
          onError={() => setFailedImageUrl(imageUrl)}
          className={cn(
            'object-cover',
            !isProfileGrid &&
              'transition-transform duration-200 ease-out pc:group-hover:scale-[1.02]',
          )}
        />
      ) : !isProfileGrid ? (
        <span
          className="absolute inset-0 flex items-center justify-center bg-point-50 text-primary-300"
          aria-hidden="true"
        >
          <PawIcon className="size-10 opacity-70 pc:size-16" />
        </span>
      ) : null}

      {imageCount > 1 && (
        <span className="absolute top-1 right-1 flex h-[1.375rem] min-w-10 items-center justify-center rounded-full bg-neutral-850/90 px-2 text-[0.625rem] leading-[1.5] font-semibold text-white pc:top-2.5 pc:right-3">
          {imageCount}장
        </span>
      )}

      {isProfileGrid && (
        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-2 bg-black/60 text-sm leading-[1.5] font-semibold text-neutral-50 opacity-0 transition-opacity pc:flex pc:group-hover:opacity-100">
          <span className="flex items-center gap-1">
            <FavoriteIcon className="size-8" />
            {likeCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <PixelMessageIcon className="size-8" />
            {commentCount ?? 0}
          </span>
        </span>
      )}
    </Link>
  )
}

export { CommunityMediaCard }
export type { CommunityMediaCardProps }

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PawIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface CommunityMediaCardProps {
  href: string
  imageUrl?: string
  imageCount: number
  alt: string
  preload?: boolean
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
  className,
}: CommunityMediaCardProps) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={`${alt} 게시글 보기`}
      className={cn(
        'group/media relative block size-[7.625rem] shrink-0 overflow-hidden rounded-lg border border-neutral-300 bg-point-50',
        'transition-shadow duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'pc:size-[18.75rem] pc:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      {showImage ? (
        <Image
          src={imageUrl!}
          alt=""
          fill
          sizes="(min-width: 1440px) 300px, 122px"
          loading={preload ? 'eager' : 'lazy'}
          fetchPriority={preload ? 'high' : 'auto'}
          onError={() => setFailedImageUrl(imageUrl)}
          className="object-cover transition-transform duration-200 ease-out pc:group-hover/media:scale-[1.02]"
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center bg-point-50 text-primary-300"
          aria-hidden="true"
        >
          <PawIcon className="size-10 opacity-70 pc:size-16" />
        </span>
      )}

      {imageCount > 1 && (
        <span className="absolute top-1 right-1 flex h-[1.375rem] min-w-10 items-center justify-center rounded-full bg-neutral-850/90 px-2 text-[0.625rem] leading-[1.5] font-semibold text-white pc:top-2.5 pc:right-3">
          {imageCount}장
        </span>
      )}
    </Link>
  )
}

export { CommunityMediaCard }
export type { CommunityMediaCardProps }

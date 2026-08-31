'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PawIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface MediaCardProps {
  href: string
  thumbnailUrl?: string
  alt: string
  /** 이미지 위에 얹는 요소 (뱃지·즐겨찾기 토글 등) */
  overlay?: ReactNode
  /** 본문 좌측 — 제목/부제 */
  children: ReactNode
  /** 본문 우측 — 상태 뱃지 */
  trailing?: ReactNode
  /** 썸네일 비율·라운드 오버라이드 (카드마다 시안 값이 조금 다르다) */
  thumbnailClassName?: string
  /** fill 이미지 반응형 크기 힌트 — 기본값은 그리드 카드(모바일 2열/PC 4열) 기준 */
  sizes?: string
  /** 첫 화면 LCP 후보 카드에서만 이미지 선로딩 */
  preload?: boolean
  className?: string
}

/**
 * 카드 공용 셸 (Figma card 797-88337 CardHeart) — 분양 카드와 브리더 카드가 공유한다.
 *
 * 이미지(348:284, mo·tab radius 4 / pc radius 8) + 오버레이 슬롯,
 * 본문은 mo·tab 8px / pc 12px 여백으로 좌측 텍스트와 우측 뱃지를 배치한다.
 * 내용물(성별/위치 아이콘, 하트/별, 뱃지 종류)만 호출부가 갈아 끼운다.
 */
const MediaCard = ({
  href,
  thumbnailUrl,
  alt,
  overlay,
  children,
  trailing,
  thumbnailClassName,
  sizes = '(max-width: 767px) 50vw, (max-width: 1200px) 33vw, 25vw',
  preload = false,
  className,
}: MediaCardProps) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string>()
  const showImage = Boolean(thumbnailUrl) && failedImageUrl !== thumbnailUrl

  return (
    <article
      className={cn(
        'group/media relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-white transition-[box-shadow] duration-200 ease-out',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 pc:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-[348/284] w-full overflow-hidden rounded bg-point-50 pc:rounded-lg',
          thumbnailClassName,
        )}
      >
        {showImage ? (
          <Image
            src={thumbnailUrl!}
            alt={alt}
            fill
            sizes={sizes}
            loading={preload ? 'eager' : 'lazy'}
            fetchPriority={preload ? 'high' : 'auto'}
            onError={() => setFailedImageUrl(thumbnailUrl)}
            className="object-cover transition-transform duration-200 ease-out pc:group-hover/media:scale-[1.02] motion-reduce:transform-none"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-point-50 text-primary-300"
            role="img"
            aria-label={`${alt} 이미지 없음`}
          >
            <PawIcon className="size-12 opacity-70 pc:size-14" />
          </div>
        )}

        <Link
          href={href}
          aria-label={`${alt} 상세 보기`}
          className="absolute inset-0 z-[1] focus-visible:outline-none"
        />

        <div className="pointer-events-none absolute inset-0 z-[2] [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {overlay}
        </div>
      </div>

      <Link
        href={href}
        className="flex min-h-[3.875rem] items-start justify-between gap-2 p-2 focus-visible:outline-none pc:p-3"
      >
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        {trailing}
      </Link>
    </article>
  )
}

export { MediaCard }

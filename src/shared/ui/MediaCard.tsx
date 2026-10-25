'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { CardImage } from './CardImage'

interface MediaCardProps {
  href: string
  thumbnailUrl?: string
  alt: string
  title: string
  description: string
  /** 제목 앞 (레벨 배지 등) */
  titleLeading?: ReactNode
  /** 제목 뒤 (성별 아이콘 등) */
  titleTrailing?: ReactNode
  /** 사진 좌상단 */
  badge?: ReactNode
  /** 사진 우하단 — 즐겨찾기처럼 링크 밖에서 눌리는 버튼 */
  action?: ReactNode
  /** 보조 정보 아래 상태 뱃지 */
  status?: ReactNode
  /** 분양 완료처럼 사진을 흐리게 덮을 때 */
  dimmed?: boolean
  sizes?: string
  preload?: boolean
}

// [refactored] function 선언 → 화살표 함수, 주석 한국어화
/** 세로 카드 — 모양(크기·글자·배지 위치)은 이 컴포넌트가 정하고 호출부는 내용만 넘긴다. */
const MediaCard = ({
  href,
  thumbnailUrl,
  alt,
  title,
  description,
  titleLeading,
  titleTrailing,
  badge,
  action,
  status,
  dimmed,
  sizes = '(max-width: 767px) 50vw, (max-width: 1439px) 33vw, 25vw',
  preload,
}: MediaCardProps) => {
  return (
    <article className="group/media relative flex h-full w-full min-w-0 card-interactive flex-col overflow-hidden rounded-lg bg-white">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-point-50">
        <CardImage src={thumbnailUrl} alt={alt} sizes={sizes} preload={preload} />
        {dimmed && <span className="pointer-events-none absolute inset-0 bg-white/70" />}
        <Link
          href={href}
          aria-label={`${title} 상세 보기`}
          className="absolute inset-0 focus-ring-inset"
        />
        {badge && (
          <div className="pointer-events-none absolute top-2 left-2 flex flex-wrap gap-1">
            {badge}
          </div>
        )}
        {action && <div className="absolute right-1 bottom-1 flex">{action}</div>}
      </div>
      <Link href={href} className="flex min-w-0 flex-1 flex-col gap-1 p-2 focus-ring-inset tab:p-3">
        <div className="flex min-h-6 min-w-0 items-center gap-1">
          {titleLeading}
          <p className="min-w-0 truncate text-body-md font-semibold text-neutral-850 tab:text-body-lg">
            {title}
          </p>
          {titleTrailing}
        </div>
        <p className="truncate text-body-sm text-neutral-700 tab:text-body-md">
          {description || '\u00a0'}
        </p>
        {status && <div className="mt-1 flex flex-wrap gap-1">{status}</div>}
      </Link>
    </article>
  )
}

export { MediaCard }

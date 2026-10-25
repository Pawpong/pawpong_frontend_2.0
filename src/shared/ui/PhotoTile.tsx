'use client'

import type { MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'
import { CardImage } from './CardImage'

interface PhotoTileProps {
  href: string
  imageUrl?: string
  alt: string
  count?: number
  preload?: boolean
  sizes: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  /** 사진 아래쪽에 얹는 상태 (공개 보류 등) */
  status?: ReactNode
  /** PC 에서 마우스를 올렸을 때 덮는 내용 (좋아요·댓글 수) */
  hoverContent?: ReactNode
}

// [refactored] function 선언 → 화살표 함수, 인라인 props 타입 → interface, 주석 한국어화
/** 사진만 있는 정사각 카드. 폭은 카드가 아니라 목록이 정한다. */
const PhotoTile = ({
  href,
  imageUrl,
  alt,
  count = 0,
  preload,
  sizes,
  onClick,
  status,
  hoverContent,
}: PhotoTileProps) => (
  <Link
    href={href}
    prefetch={false}
    onClick={onClick}
    aria-label={`${alt} 게시글 보기`}
    className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-point-50 focus-ring"
  >
    <CardImage src={imageUrl} alt="" sizes={sizes} preload={preload} />
    {count > 1 && (
      <span className="absolute top-2 right-2 rounded bg-neutral-850/85 px-2 py-0.5 text-body-sm font-medium text-white">
        {count}장
      </span>
    )}
    {hoverContent && (
      <span className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-2 bg-neutral-850/70 text-body-md font-semibold text-white opacity-0 transition-opacity group-focus-visible:opacity-100 pc:flex pc:group-hover:opacity-100">
        {hoverContent}
      </span>
    )}
    {status && <span className="absolute right-2 bottom-2 left-2">{status}</span>}
  </Link>
)

export { PhotoTile }

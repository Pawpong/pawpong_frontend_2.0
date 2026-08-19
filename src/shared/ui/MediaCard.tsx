import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  className?: string
}

/**
 * 카드 공용 셸 (Figma card 797-88337 CardHeart) — 분양 카드와 브리더 카드가 공유한다.
 *
 * 이미지(348:284, radius 8) + 오버레이 슬롯, 본문은 좌측 텍스트 + 우측 뱃지.
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
  className,
}: MediaCardProps) => (
  <Link href={href} className={cn('flex h-full w-full flex-col', className)}>
    <div
      className={cn(
        'relative aspect-[348/284] w-full overflow-hidden rounded-lg bg-neutral-700',
        thumbnailClassName,
      )}
    >
      {thumbnailUrl && <Image src={thumbnailUrl} alt={alt} fill className="object-cover" />}
      {overlay}
    </div>

    <div className="flex min-h-[4.3125rem] items-start justify-between gap-2 p-2 tab:p-3">
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      {trailing}
    </div>
  </Link>
)

export { MediaCard }

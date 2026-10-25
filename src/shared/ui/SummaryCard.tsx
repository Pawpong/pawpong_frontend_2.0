import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets'
import { CardImage } from './CardImage'

interface SummaryCardProps {
  href: string
  imageUrl?: string
  title: string
  description?: string
  status?: ReactNode
  /** 사진 좌상단 뱃지 */
  badge?: ReactNode
}

// [refactored] function 선언 → 화살표 함수, 인라인 props 타입 → interface, 주석 한국어화
/** 다른 화면으로 이어지는 가로 요약 카드 — 왼쪽 사진, 상태 → 제목 → 설명, 오른쪽 화살표로 고정한다. */
const SummaryCard = ({ href, imageUrl, title, description, status, badge }: SummaryCardProps) => (
  <Link
    href={href}
    className="flex w-full min-w-0 items-center gap-3 rounded-lg bg-white p-3 focus-ring tab:gap-4 tab:p-4"
  >
    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-point-50 tab:size-24">
      <CardImage src={imageUrl} alt={title} sizes="(min-width: 768px) 96px, 80px" />
      {badge && <div className="absolute top-1 left-1">{badge}</div>}
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {status && <div className="text-body-sm font-semibold text-primary-600">{status}</div>}
      <p className="truncate text-body-md font-semibold text-neutral-850 tab:text-body-lg">
        {title}
      </p>
      {description && (
        <p className="line-clamp-2 text-body-sm text-neutral-700 tab:text-body-md">{description}</p>
      )}
    </div>
    <ArrowRightIcon aria-hidden className="size-5 shrink-0 text-neutral-700" />
  </Link>
)

export { SummaryCard }

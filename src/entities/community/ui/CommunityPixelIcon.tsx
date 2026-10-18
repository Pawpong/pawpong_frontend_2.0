import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const ANIMALS = {
  cat: '/images/community/face-cat.png',
  dog: '/images/community/face-dog.png',
  reptile: '/images/community/face-lizard.png',
} as const

// 24px 격자의 계단형 윤곽과 프로젝트 색상 토큰을 공유한다.
const cream = 'var(--color-secondary-100)'
const gold = 'var(--color-secondary-400)'
const ink = 'var(--color-primary-700)'
const ICONS = {
  walk: (
    <>
      <path d="M3 5h4v5H3zM10 2h4v6h-4zM17 5h4v5h-4z" fill={gold} />
      <path d="M9 11h6v3h3v6h-3v1H9v-1H6v-6h3z" fill={cream} />
      <path d="M10 16h4v2h-4z" fill={gold} stroke="none" />
    </>
  ),
  clinic: (
    <>
      <path d="M8 7V3h8v4" fill="none" />
      <path d="M4 7h16v2h2v11H2V9h2z" fill={cream} />
      <path d="M10 10h4v3h3v4h-3v3h-4v-3H7v-4h3z" fill={gold} stroke="none" />
      <path d="M2 9h3v11H2zM19 9h3v11h-3z" fill={gold} stroke="none" />
    </>
  ),
  life: (
    <>
      <path d="M2 11h3V8h3V5h3V3h2v2h3v3h3v3h3v3h-3v7H5v-7H2z" fill={cream} />
      <path d="M9 21v-7h6v7M6 11h12" fill={gold} />
    </>
  ),
  travel: (
    <>
      <path d="M8 6V2h8v4" fill="none" />
      <path d="M4 6h16v2h2v12h-2v1H4v-1H2V8h2z" fill={cream} />
      <path d="M6 7v13M18 7v13" />
      <path d="M10 11h4v5h-4z" fill={gold} stroke="none" />
    </>
  ),
  question: (
    <>
      <path d="M4 2h16v2h2v14h-2v2h-9v2H7v-2H4v-2H2V4h2z" fill={cream} />
      <path d="M8 8V6h7v2h2v3h-3v3h-3v-4h3V8zM11 16h3v2h-3z" fill={ink} stroke="none" />
    </>
  ),
  tag: (
    <>
      <path d="M3 3h10v2h2v2h2v2h2v2h2v3h-2v2h-2v2h-2v2h-3v-2H9v-2H7v-2H5v-2H3z" fill={cream} />
      <path d="M6 6h4v4H6z" fill={gold} />
    </>
  ),
  all: (
    <>
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" fill={cream} />
      <path d="M14 14h7v7h-7z" fill={gold} />
    </>
  ),
  heart: (
    <>
      <path d="M4 4h5v2h6V4h5v2h2v7h-2v3h-3v3h-3v2h-4v-2H7v-3H4v-3H2V6h2z" fill={cream} />
      <path d="M4 12h4l2-4 4 8 2-4h4" fill="none" stroke="var(--color-primary-500)" />
    </>
  ),
  bone: (
    <>
      <path
        d="M4 4h3v2h2v2h6V6h2V4h3v2h2v4h-2v4h2v4h-2v2h-3v-2h-2v-2H9v2H7v2H4v-2H2v-4h2v-4H2V6h2z"
        fill={cream}
      />
      <path d="M9 10h6v4H9z" fill={gold} stroke="none" />
    </>
  ),
  spark: (
    <>
      <path d="M10 3h4v5h3v3h4v3h-4v3h-3v5h-4v-5H7v-3H3v-3h4V8h3z" fill={gold} />
      <path d="M19 2v5M17 4h5" stroke="var(--color-primary-500)" />
      <path d="M10 11h4v3h-4z" fill={cream} stroke="none" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type CommunityPixelIconName = keyof typeof ICONS | keyof typeof ANIMALS

export function CommunityPixelIcon({
  name,
  className,
}: {
  name: CommunityPixelIconName
  className?: string
}) {
  if (name in ANIMALS) {
    return (
      <Image
        src={ANIMALS[name as keyof typeof ANIMALS]}
        alt=""
        width={48}
        height={48}
        className={cn('size-6 shrink-0 object-contain [image-rendering:pixelated]', className)}
      />
    )
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ink}
      strokeWidth={1.5}
      strokeLinejoin="miter"
      className={cn('size-5 shrink-0', className)}
    >
      {ICONS[name as keyof typeof ICONS]}
    </svg>
  )
}

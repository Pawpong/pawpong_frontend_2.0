import Image from 'next/image'
import type { ReactNode } from 'react'
import { PawPrintIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { SkeletonBlock } from './Skeleton'
import { TicketStrip, ticketStyles, type TicketAccent } from './Ticket'

interface FeatureShowcaseProps {
  /** 제목 요소 id. 섹션의 aria-labelledby 로 연결한다. */
  headingId: string
  /** 윗단 영문 라벨. 예: AI PHOTO */
  label: string
  /** 윗단 오른쪽 아이콘. 장식이므로 aria-hidden 으로 넘긴다. */
  icon?: ReactNode
  accent?: TicketAccent
  eyebrow: string
  title: string
  description: ReactNode
  actions: ReactNode
  /** 오른쪽 예시 영역. 보통 FeatureShowcaseTiles 를 넣는다. */
  media: ReactNode
  steps?: readonly string[]
  className?: string
}

/**
 * 놀이터 기능 소개 카드 공통 셸. PLAY CARD 와 같은 티켓 틀을 크게 쓴다.
 * 윗단 라벨 → 머리말 → 픽셀 제목 → 설명 → 버튼, 오른쪽 예시 타일, 절취선 아래 번호 단계 순서를 모든 기능이 같이 쓴다.
 */
export function FeatureShowcase({
  headingId,
  label,
  icon,
  accent = 'butter',
  eyebrow,
  title,
  description,
  actions,
  media,
  steps,
  className,
}: FeatureShowcaseProps) {
  return (
    <section
      aria-labelledby={headingId}
      data-accent={accent}
      className={cn(ticketStyles.ticket, className)}
    >
      <TicketStrip label={label} icon={icon} />
      <div className="grid items-center gap-7 p-5 tab:p-8 lap:grid-cols-[1fr_1.1fr] lap:gap-10">
        <div>
          <p className="text-xs font-semibold text-primary-600">{eyebrow}</p>
          <h2
            id={headingId}
            className="mt-1 font-cafe24 text-2xl leading-snug break-keep text-neutral-850 tab:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 break-keep text-neutral-700">{description}</p>
          {/* 모바일은 꽉 채우고 태블릿부터 글자 폭에 맞춘다. 버튼 계약상 폭은 감싸는 칸이 정한다. */}
          <div className="mt-5 flex flex-col gap-3 tab:flex-row">{actions}</div>
        </div>
        {media}
      </div>

      {steps && steps.length > 0 && (
        <ol
          className={cn(
            ticketStyles.stub,
            'grid gap-3 p-5 text-sm text-neutral-850 tab:grid-cols-3 tab:gap-5 tab:px-8',
          )}
        >
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className={ticketStyles.stubNumber}>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

interface FeatureShowcaseTile {
  key: string
  src: string
  alt: string
  caption: string
  /** 작은 도트 원본을 키울 때 계단 모양을 살린다. */
  pixelated?: boolean
}

/** 기능 예시 3칸 타일. 사진 예시와 도트 소품 예시가 같은 틀을 쓴다. */
export function FeatureShowcaseTiles({
  label,
  tiles,
}: {
  label: string
  tiles: readonly FeatureShowcaseTile[]
}) {
  return (
    <div className="grid min-w-0 grid-cols-3 gap-2 tab:gap-3" aria-label={label}>
      {tiles.map((tile) => (
        <figure key={tile.key} className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary-50">
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              loading="eager"
              unoptimized={tile.pixelated}
              sizes="(max-width: 767px) 28vw, (max-width: 1023px) 26vw, 150px"
              className={cn(
                'object-contain',
                tile.pixelated ? 'p-[18%] [image-rendering:pixelated]' : 'p-1.5',
              )}
            />
          </div>
          <figcaption className="mt-2 text-center text-xs leading-5 font-medium break-keep text-neutral-700">
            {tile.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/** 예시를 불러오는 동안 같은 3칸 틀에 빈 칸과 이름 자리를 둔다. 다 불러와도 자리가 흔들리지 않는다. */
export function FeatureShowcaseTilesSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="grid min-w-0 grid-cols-3 gap-2 tab:gap-3">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((index) => (
        <div key={index} className="min-w-0">
          <SkeletonBlock className="aspect-square w-full rounded-xl" />
          <SkeletonBlock className="mx-auto mt-2 h-5 w-3/5 rounded-md" />
        </div>
      ))}
    </div>
  )
}

/** 예시가 아직 없을 때 쓰는 발바닥 자리. */
export function FeatureShowcasePlaceholder() {
  return (
    <div
      className="flex items-center justify-center gap-5 rounded-xl bg-point-50 px-6 py-10"
      aria-hidden
    >
      <PawPrintIcon className="size-10 -rotate-12 text-secondary-300" />
      <PawPrintIcon className="size-20 rotate-12 text-secondary-500" />
      <PawPrintIcon className="size-10 -rotate-12 text-secondary-300" />
    </div>
  )
}

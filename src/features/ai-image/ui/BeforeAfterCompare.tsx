'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

interface BeforeAfterCompareProps {
  beforeSrc: string
  afterSrc: string
  /** 도트 결과는 픽셀이 뭉개지지 않게 그린다 */
  pixelated?: boolean
  className?: string
}

/**
 * 원본과 필터 결과를 한 장에 겹쳐 두고, 손잡이를 끌어 경계를 옮기며 비교한다.
 * 조작은 range input 이라 키보드(좌우 화살표)와 스크린리더로도 된다.
 */
export function BeforeAfterCompare({
  beforeSrc,
  afterSrc,
  pixelated,
  className,
}: BeforeAfterCompareProps) {
  const [position, setPosition] = useState(55)

  return (
    <div
      className={cn(
        'relative aspect-square w-full touch-none overflow-hidden rounded-xl bg-neutral-50 select-none',
        className,
      )}
    >
      <Image
        src={afterSrc}
        alt="필터 적용 결과"
        fill
        unoptimized
        sizes="(min-width: 768px) 480px, 100vw"
        className={cn('object-cover', pixelated && '[image-rendering:pixelated]')}
      />
      {/* 왼쪽(원본)만 잘라 보여준다 */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image
          src={beforeSrc}
          alt="원본 사진"
          fill
          unoptimized
          sizes="(min-width: 768px) 480px, 100vw"
          className="object-cover"
        />
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
        원본
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-primary-500 px-2.5 py-1 text-xs font-semibold text-white">
        AI 필터
      </span>

      {/* 경계선 + 손잡이 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-primary-500 text-sm font-bold text-white shadow-md">
          ⇆
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="원본과 결과 비교 위치"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}

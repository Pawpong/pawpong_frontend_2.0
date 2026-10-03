'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PawPrintIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/Button'

export function PetImage({
  src,
  alt,
  compact = false,
}: {
  src: string
  alt: string
  compact?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (failed)
    return (
      <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 px-2 text-center text-sm text-neutral-700">
        <PawPrintIcon className="size-10 text-secondary-500" aria-hidden />
        <p>{compact ? '사진을 불러오지 못했어요' : '사진을 불러오지 못했지만 친구는 잘 있어요.'}</p>
        {!compact && (
          <Button intent="secondary" size="lg" onClick={() => setFailed(false)}>
            사진 다시 보기
          </Button>
        )}
      </div>
    )
  return (
    <Image
      src={src}
      alt={alt}
      width={320}
      height={320}
      unoptimized
      onError={() => setFailed(true)}
      className="h-full w-full object-contain [image-rendering:pixelated]"
    />
  )
}

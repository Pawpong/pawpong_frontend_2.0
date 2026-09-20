'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { isHeifPhoto, MAX_PHOTO_BYTES, preparePhoto } from '@/shared/lib/preparePhoto'

interface Props {
  src: string
  alt: string
  sizes: string
  unoptimized?: boolean
}

// Remount on source changes so an old conversion cannot replace the current photo.
export function RepresentativePhoto(props: Props) {
  return <PhotoWithFallback key={props.src} {...props} />
}

function PhotoWithFallback({ src, alt, sizes, unoptimized }: Props) {
  const [converted, setConverted] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'converting' | 'failed'>('idle')
  const request = useRef<AbortController | null>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(
    () => () => {
      request.current?.abort()
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    },
    [],
  )

  const recover = async (source: string) => {
    if (request.current) {
      if (converted) setStatus('failed')
      return
    }
    const controller = new AbortController()
    request.current = controller
    setStatus('converting')
    try {
      // Use the failed Next image URL: same-origin access avoids storage CORS issues.
      const response = await fetch(source, { signal: controller.signal })
      if (!response.ok) throw new Error('Photo unavailable')
      if (Number(response.headers.get('content-length')) > MAX_PHOTO_BYTES)
        throw new Error('Photo too large')
      const blob = await response.blob()
      if (blob.size > MAX_PHOTO_BYTES || !(await isHeifPhoto(blob)))
        throw new Error('Not a supported HEIF photo')
      const file = await preparePhoto(
        new File([blob], 'representative.heic', { type: 'image/heic' }),
      )
      if (controller.signal.aborted) return
      const url = URL.createObjectURL(file)
      objectUrl.current = url
      setConverted(url)
      setStatus('idle')
    } catch {
      if (!controller.signal.aborted) setStatus('failed')
    }
  }

  if (status === 'failed')
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex size-full items-center justify-center p-2 text-center text-xs text-neutral-500"
      >
        사진을 불러오지 못했어요
      </div>
    )

  return (
    <>
      <Image
        src={converted ?? src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={Boolean(converted) || unoptimized}
        className="object-cover"
        onError={(event) => {
          void recover(event.currentTarget.currentSrc || event.currentTarget.src)
        }}
      />
      {status === 'converting' && (
        <span
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-xs text-neutral-500"
        >
          사진을 불러오는 중이에요
        </span>
      )}
    </>
  )
}

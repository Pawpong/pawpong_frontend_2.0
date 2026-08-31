'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PawIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

interface ContestEntryImageProps {
  src?: string | null
  alt: string
  sizes: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
  fallbackClassName?: string
  fallbackIconClassName?: string
}

/**
 * 콘테스트 이미지 공통 렌더러.
 *
 * 신규 참여작은 스토리지 URL을 사용하지만 과거 개발 데이터나 만료된 외부 URL도
 * 명예의 전당에 남을 수 있어, 로딩 실패 시 깨진 이미지 대신 브랜드 폴백을 표시한다.
 */
const ContestEntryImage = ({
  src,
  alt,
  sizes,
  loading = 'lazy',
  fetchPriority = 'auto',
  className,
  fallbackClassName,
  fallbackIconClassName,
}: ContestEntryImageProps) => {
  const [failedSource, setFailedSource] = useState<string>()
  const showImage = Boolean(src) && failedSource !== src

  if (showImage) {
    return (
      <Image
        src={src!}
        alt={alt}
        fill
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
        onError={() => setFailedSource(src!)}
        className={cn('object-cover', className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={`${alt} 이미지 없음`}
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-point-100 text-primary-300',
        fallbackClassName,
      )}
    >
      <PawIcon className={cn('size-10 opacity-70', fallbackIconClassName)} aria-hidden="true" />
    </span>
  )
}

export { ContestEntryImage }
export type { ContestEntryImageProps }

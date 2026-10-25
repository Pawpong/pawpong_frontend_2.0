'use client'

import { useState } from 'react'
import { SessionImage } from './SessionImage'
import { PawPrintIcon } from '@/shared/assets'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import { isSessionImageSource, sessionImageSource } from '@/shared/lib/sessionImageSource'

interface CardImageProps {
  src?: string
  alt: string
  sizes: string
  preload?: boolean
}

// [refactored] function 선언 → 화살표 함수, 주석 한국어화
/** 정사각 틀은 부모가 잡는다 — 카드 사진의 자르기·사진 없음·로그인 사진 재시도를 한 곳에서 처리한다. */
const CardImage = ({ src, alt, sizes, preload = false }: CardImageProps) => {
  const [failed, setFailed] = useState<string>()
  const session = useAuthReadSession()
  // 로그인 사진은 세션이 바뀌면 다른 이미지로 보고 실패 기록을 비운다
  const identity = isSessionImageSource(src)
    ? sessionImageSource(src!, session?.scope ?? 'anonymous')
    : src
  return src && failed !== identity ? (
    <SessionImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={preload ? 'eager' : 'lazy'}
      fetchPriority={preload ? 'high' : 'auto'}
      onError={() => setFailed(identity)}
      className="object-cover"
    />
  ) : (
    <span
      role="img"
      aria-label={`${alt || '사진'} 이미지 없음`}
      className="absolute inset-0 flex items-center justify-center bg-point-50 text-primary-300"
    >
      <PawPrintIcon className="size-1/3 max-w-16" />
    </span>
  )
}

export { CardImage }

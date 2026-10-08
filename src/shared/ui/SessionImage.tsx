'use client'

import Image, { type ImageProps } from 'next/image'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import { isSessionImageSource, sessionImageSource } from '@/shared/lib/sessionImageSource'

function AuthenticatedImage(props: ImageProps & { src: string }) {
  const session = useAuthReadSession()
  const scope = session?.scope ?? 'anonymous'
  return (
    <Image
      {...props}
      alt={props.alt}
      key={`${props.src}:${scope}`}
      src={sessionImageSource(props.src, scope)}
      unoptimized
      preload={false}
      priority={false}
      placeholder="empty"
      overrideSrc={undefined}
      loader={undefined}
    />
  )
}

/** 쿠키 인증 이미지의 디코딩 결과를 다른 로그인 세션에서 재사용하지 않는다. */
export function SessionImage(props: ImageProps) {
  return isSessionImageSource(props.src) ? (
    <AuthenticatedImage {...props} src={props.src} />
  ) : (
    <Image {...props} alt={props.alt} />
  )
}

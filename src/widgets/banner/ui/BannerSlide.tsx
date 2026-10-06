'use client'

import { useState } from 'react'
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import type { BannerDto } from '@/shared/types'
import { BannerCopy } from './BannerCopy'
import styles from './BannerCopy.module.css'

/** 링크 래퍼 — 표시(BannerSlide)와 링크 분기 로직 분리 (SRP) */
const BannerLink = ({ banner, children }: { banner: BannerDto; children: React.ReactNode }) => {
  if (!banner.linkUrl) return <>{children}</>
  if (banner.linkType === 'external') {
    return (
      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {children}
      </a>
    )
  }
  return (
    <Link href={banner.linkUrl} className="block">
      {children}
    </Link>
  )
}

//QA: 배너 컴포넌트 분리 — API 이미지/링크 렌더링은 BannerSlide가 담당하고,
//QA: 슬라이드 이동과 양옆 미리보기 배치는 부모 Banner가 담당한다.
const BannerSlide = ({ banner }: { banner: BannerDto }) => {
  const [failedMobileImageUrl, setFailedMobileImageUrl] = useState<string | null>(null)
  const mobileImageUrl =
    banner.mobileImageUrl && failedMobileImageUrl !== banner.mobileImageUrl
      ? banner.mobileImageUrl
      : banner.desktopImageUrl
  // Swiper의 실제 폭(태블릿 78.75vw, PC 최대 1134px)에 맞는 해상도를 요청한다.
  const { props: desktopImage } = getImageProps({
    src: banner.desktopImageUrl,
    alt: banner.textOverlay ? '' : (banner.title ?? ''),
    fill: true,
    sizes: '(min-width: 90rem) 70.875rem, 78.75vw',
    quality: 100,
  })

  return (
    <BannerLink banner={banner}>
      <section
        data-banner-slide
        className="relative w-full overflow-hidden rounded-[0.4455rem] bg-[#d9d9d9] tab:rounded pc:rounded-xl"
      >
        {/* //QA: 이미지 비율 수정 — breakpoint별 Figma 원본 비율을 유지해 이미지 왜곡을 방지한다. */}
        <div
          className={`${styles.frame} relative aspect-[375/191.6667] tab:aspect-[604.8/241.0667] pc:aspect-[1134/452]`}
        >
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={desktopImage.srcSet ?? desktopImage.src}
              sizes={desktopImage.sizes}
            />
            <Image
              src={mobileImageUrl}
              alt={banner.textOverlay ? '' : (banner.title ?? '')}
              fill
              sizes="100vw"
              quality={100}
              className="object-cover"
              onError={() => {
                if (
                  !window.matchMedia('(min-width: 768px)').matches &&
                  mobileImageUrl !== banner.desktopImageUrl
                ) {
                  setFailedMobileImageUrl(banner.mobileImageUrl)
                }
              }}
              loading="eager"
            />
          </picture>
          {banner.textOverlay && <BannerCopy copy={banner.textOverlay} />}
        </div>
      </section>
    </BannerLink>
  )
}

export { BannerSlide }

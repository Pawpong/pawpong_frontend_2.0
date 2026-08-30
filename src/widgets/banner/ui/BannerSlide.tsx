'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { BannerDto } from '@/shared/types'

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

const BannerSlide = ({ banner }: { banner: BannerDto }) => {
  const [mobileImageFailed, setMobileImageFailed] = useState(!banner.mobileImageUrl)
  const mobileImageUrl = mobileImageFailed ? banner.desktopImageUrl : banner.mobileImageUrl

  return (
    <BannerLink banner={banner}>
      <section className="relative w-full overflow-hidden rounded-[0.4455rem] bg-[#d9d9d9] tab:rounded pc:rounded-xl">
        <div className="relative aspect-[375/191.6667] tab:aspect-[604.8/241.0667] pc:aspect-[1134/452]">
          <Image
            src={banner.desktopImageUrl}
            alt={banner.title ?? ''}
            fill
            sizes="(min-width: 90rem) 70.875rem, 37.8rem"
            className="hidden object-cover tab:block"
            loading="eager"
          />
          <Image
            src={mobileImageUrl}
            alt={banner.title ?? ''}
            fill
            sizes="23.4375rem"
            className="object-cover tab:hidden"
            onError={() => {
              if (!mobileImageFailed && mobileImageUrl !== banner.desktopImageUrl) {
                setMobileImageFailed(true)
              }
            }}
            loading="eager"
          />
        </div>
      </section>
    </BannerLink>
  )
}

export { BannerSlide }

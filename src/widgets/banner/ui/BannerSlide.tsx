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
        <div className="relative hidden tab:block tab:aspect-[673.61/268.494] pc:aspect-[1120/447]">
          <Image
            src={banner.desktopImageUrl}
            alt={banner.title ?? ''}
            fill
            sizes="(min-width: 90rem) 70rem, 42.1007rem"
            className="object-cover"
            priority
          />
        </div>

        <div className="relative block aspect-[315/161] tab:hidden">
          <Image
            src={mobileImageUrl}
            alt={banner.title ?? ''}
            fill
            sizes="19.6875rem"
            className="object-cover"
            onError={() => {
              if (!mobileImageFailed && mobileImageUrl !== banner.desktopImageUrl) {
                setMobileImageFailed(true)
              }
            }}
            priority
          />
        </div>
      </section>
    </BannerLink>
  )
}

export { BannerSlide }

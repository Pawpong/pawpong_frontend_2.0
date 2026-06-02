import Image from 'next/image'
import Link from 'next/link'
import type { BannerDto } from '@/shared/types'

/** 링크 래퍼 — 표시(BannerSlide)와 링크 분기 로직 분리 (SRP) */
const BannerLink = ({ banner, children }: { banner: BannerDto; children: React.ReactNode }) => {
  if (!banner.linkUrl) return <>{children}</>
  if (banner.linkType === 'external') {
    return (
      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return <Link href={banner.linkUrl}>{children}</Link>
}

const BannerSlide = ({ banner }: { banner: BannerDto }) => {
  // Desktop/Mobile 이미지 블록 (src/aspect만 차이)
  const images = [
    {
      key: 'desktop',
      src: banner.desktopImageUrl,
      wrapperClass: 'hidden aspect-[768/347] tab:block pc:aspect-[180/47]',
    },
    {
      key: 'mobile',
      src: banner.mobileImageUrl,
      wrapperClass: 'block aspect-[375/323] tab:hidden',
    },
  ]

  return (
    <BannerLink banner={banner}>
      <section className="relative w-full overflow-hidden bg-[#d9d9d9]">
        {images.map(({ key, src, wrapperClass }) => (
          <div key={key} className={wrapperClass}>
            <Image src={src} alt={banner.title ?? ''} fill className="object-cover" priority />
          </div>
        ))}
      </section>
    </BannerLink>
  )
}

export { BannerSlide }

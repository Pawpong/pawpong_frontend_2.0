'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import type { BannerDto } from '@/shared/types'
import 'swiper/css'
import 'swiper/css/pagination'

const BannerSlide = ({ banner }: { banner: BannerDto }) => {
  const content = (
    <section className="relative w-full overflow-hidden bg-[#d9d9d9]">
      {/* Desktop */}
      <div className="hidden aspect-[16/5] tab:block">
        <Image
          src={banner.desktopImageUrl}
          alt={banner.title ?? ''}
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Mobile */}
      <div className="block aspect-[16/9] tab:hidden">
        <Image
          src={banner.mobileImageUrl}
          alt={banner.title ?? ''}
          fill
          className="object-cover"
          priority
        />
      </div>
    </section>
  )

  if (banner.linkUrl) {
    if (banner.linkType === 'external') {
      return (
        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      )
    }
    return <Link href={banner.linkUrl}>{content}</Link>
  }

  return content
}

const Banner = () => {
  const { data: banners } = useQuery(homeQueries.banners())

  if (!banners || banners.length === 0) return null

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={banners.length > 1}
      className="w-full"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.bannerId}>
          <BannerSlide banner={banner} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export { Banner }

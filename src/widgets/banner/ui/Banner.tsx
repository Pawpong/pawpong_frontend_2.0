'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { cn } from '@/shared/lib/Cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import 'swiper/css'
import 'swiper/css/pagination'

const BANNER_SLIDES = [
  {
    title: ['건강하고 사랑스러운', '내 취향의 동물들을 찾고 계신가요?'],
    titleMobile: ['건강하고 사랑스러운', '내 취향의 동물들을', '찾고 계신가요?'],
    subtitle: '평생을 함께할 반려동물 포퐁에서 찾으세요!',
    subtitleMobile: ['평생을 함께할 반려동물', '포퐁에서 찾으세요!'],
  },
  {
    title: ['검증된 브리더만', '포퐁에서 만나보세요'],
    titleMobile: ['검증된 브리더만', '포퐁에서', '만나보세요'],
    subtitle: '브리더 인증 시스템으로 안심하고 분양받으세요',
    subtitleMobile: ['브리더 인증 시스템으로', '안심하고 분양받으세요'],
  },
  {
    title: ['반려동물과 함께하는', '행복한 일상을 시작하세요'],
    titleMobile: ['반려동물과 함께하는', '행복한 일상을', '시작하세요'],
    subtitle: '포퐁이 좋은 만남을 도와드릴게요',
    subtitleMobile: ['포퐁이 좋은 만남을', '도와드릴게요'],
  },
]

const Banner = () => {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="w-full"
    >
      {BANNER_SLIDES.map((slide, i) => (
        <SwiperSlide key={i}>
          <section className="flex w-full flex-col items-center gap-[1.25rem] bg-[#d9d9d9] px-[1.25rem] py-[2.5rem] text-center text-black tab:px-[3rem] tab:py-[6.25rem] pc:px-[6.25rem]">
            <h2
              className={cn(
                cafe24Proup.className,
                'font-cafe24 text-[1.5rem] leading-[1.5] tab:text-[2.5rem]',
              )}
            >
              {slide.title.map((line, j) => (
                <span key={j} className="hidden tab:block">{line}</span>
              ))}
              {slide.titleMobile.map((line, j) => (
                <span key={j} className="block tab:hidden">{line}</span>
              ))}
            </h2>
            <p className="text-[1.25rem] font-bold leading-[1.5] tab:text-[1.5rem]">
              <span className="hidden tab:inline">{slide.subtitle}</span>
              {slide.subtitleMobile.map((line, j) => (
                <span key={j} className="block tab:hidden">{line}</span>
              ))}
            </p>
          </section>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export { Banner }

'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { Container, SectionHeader } from '@/shared/ui'
import 'swiper/css'
import 'swiper/css/free-mode'

const CommunityShowcase = () => {
  return (
    <Container className="mt-[3rem]">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader
          title="우리 아이 자랑하기"
          linkText="커뮤니티 보러가기"
          linkHref="/community"
        />

        {/* 모바일: Swiper */}
        <div className="tab:hidden">
          <Swiper
            modules={[FreeMode]}
            freeMode
            slidesPerView="auto"
            spaceBetween={13}
          >
            {Array.from({ length: 3 }, (_, i) => (
              <SwiperSlide key={i} className="!w-[10.5rem]">
                <div className="h-[7rem] rounded-[0.5rem] bg-[#c6c6c6]" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* PC: 그리드 */}
        <div className="hidden tab:grid tab:grid-cols-3 tab:gap-[1.25rem]">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-[14rem] rounded-[1.0625rem] bg-[#c6c6c6]"
            />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { CommunityShowcase }

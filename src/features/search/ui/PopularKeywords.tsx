'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'

const POPULAR_KEYWORDS = ['강아지', '고양이', '비숑', '개코 도마뱀', '레오파드', '말티즈', '푸들']

const PopularKeywords = () => {
  return (
    <div className="mt-[1.125rem] flex items-center gap-[1.0625rem]">
      <span className="shrink-0 text-[0.875rem] font-semibold text-[#a8a8a8]">
        인기 검색어
      </span>
      <Swiper
        style={{ overflow: 'clip', minWidth: 0 }}
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={10}
        className="w-full !overflow-x-clip !overflow-y-visible"
      >
        {POPULAR_KEYWORDS.map((keyword) => (
          <SwiperSlide key={keyword} className="!w-auto">
            <span className="shrink-0 rounded-full border border-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold text-[#a8a8a8]">
              {keyword}
            </span>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export { PopularKeywords }

'use client'

import { useQuery } from '@tanstack/react-query'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import { popularKeywordQueries } from '@/entities/popular-keyword'
import 'swiper/css'
import 'swiper/css/free-mode'

const PopularKeywords = () => {
  const { data } = useQuery(popularKeywordQueries.list())
  const keywords = [...(data ?? [])].sort((a, b) => a.rank - b.rank)

  if (keywords.length === 0) return null

  return (
    <div className="mt-[1.125rem] flex items-center gap-[1.0625rem]">
      <span className="shrink-0 text-[0.875rem] font-semibold text-[#a8a8a8]">인기 검색어</span>
      <Swiper
        style={{ overflow: 'clip', minWidth: 0 }}
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={10}
        className="w-full !overflow-x-clip !overflow-y-visible"
      >
        {keywords.map((item) => (
          <SwiperSlide key={item.keywordId} className="!w-auto">
            <span className="shrink-0 rounded-full border border-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold text-[#a8a8a8]">
              {item.keyword}
            </span>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export { PopularKeywords }

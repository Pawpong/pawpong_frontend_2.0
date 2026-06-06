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

  // 라벨은 항상 노출, 키워드는 데이터 있을 때만 렌더
  return (
    <div className="mt-[1.125rem] flex items-center gap-[1.0625rem]">
      <span className="shrink-0 text-center text-base leading-[1.5] font-medium text-[#3e3e3e]">
        인기 검색어
      </span>
      {keywords.length > 0 && (
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
      )}
    </div>
  )
}

export { PopularKeywords }

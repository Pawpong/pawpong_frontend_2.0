'use client'

import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import type { AdoptionDetailDto } from '@/shared/types'

interface BreedingEnvironmentCardProps {
  detail: AdoptionDetailDto
  onImageClick?: (images: string[], index?: number) => void
}

const BreedingEnvironmentCard = ({
  detail,
  onImageClick,
}: BreedingEnvironmentCardProps) => {
  return (
    <div className="overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.875rem] tab:p-[1.75rem]">
      {/* 모바일: 세로 레이아웃 */}
      <div className="tab:hidden">
        <p className="text-[0.75rem] font-medium leading-[1.375rem] text-[#5d5d5d]">
          사육 환경
        </p>
        <p className="mt-[0.5rem] text-[0.875rem] font-semibold leading-[1.5] text-[#5d5d5d]">
          {detail.breedingEnvironment.description}
        </p>
        <div className="mt-[0.75rem] flex gap-[0.6875rem] overflow-x-auto">
          {detail.breedingEnvironment.imageUrls.map((url, i) => (
            <button
              type="button"
              key={`env-mo-${i}`}
              onClick={() => onImageClick?.(detail.breedingEnvironment.imageUrls, i)}
              className="relative h-[8.125rem] w-[11.9375rem] shrink-0 overflow-hidden rounded-[0.5rem] bg-[#c6c6c6]"
            >
              <Image src={url} alt={`사육 환경 ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 데스크탑: 좌측 Swiper 이미지 + 우측 텍스트 */}
      <div className="hidden tab:flex tab:gap-[2rem]">
        <div className="h-[24.5rem] w-[35.9375rem] shrink-0 overflow-hidden rounded-[0.5rem]">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            className="size-full [&_.swiper-pagination-bullet-active]:bg-[#2f2f2f] [&_.swiper-pagination-bullet]:bg-white/70"
          >
            {detail.breedingEnvironment.imageUrls.map((url, i) => (
              <SwiperSlide key={`env-pc-${i}`}>
                <button
                  type="button"
                  onClick={() => onImageClick?.(detail.breedingEnvironment.imageUrls, i)}
                  className="relative size-full"
                >
                  <Image
                    src={url}
                    alt={`사육 환경 ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            사육 환경
          </p>
          <p className="mt-[2rem] text-[1rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {detail.breedingEnvironment.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export { BreedingEnvironmentCard }

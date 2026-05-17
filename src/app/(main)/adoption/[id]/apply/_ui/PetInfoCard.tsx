import Image from 'next/image'
import { ShareIcon } from '@/shared/assets/icons'
import { Badge, ListingStats, FavoriteButton } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
import { getAgeText } from '../_lib/schema'

interface PetInfoCardProps {
  detail: AdoptionDetailDto
}

const PetInfoCard = ({ detail }: PetInfoCardProps) => (
  <div className="hidden tab:block">
    <div className="flex gap-[1.5rem] bg-white px-[6.25rem] py-[0.8125rem] shadow-[1px_5px_3.75px_rgba(0,0,0,0.1)]">
      {/* 이미지 */}
      <div className="relative h-[14.6875rem] w-[14.1875rem] shrink-0 overflow-hidden rounded-[0.5725rem] bg-[#c6c6c6]">
        <Image
          src={detail.imageUrls[0]}
          alt={detail.name}
          fill
          className="object-cover"
        />
      </div>

      {/* 텍스트 정보 */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-[0.875rem]">
          {/* 이름 · 성별 · 나이 */}
          <div className="flex items-center gap-[1.125rem]">
            <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
              {detail.name}
            </span>
            <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
            <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
              {GENDER_LABEL[detail.gender]}
            </span>
            <span className="size-[0.25rem] rounded-full bg-[#5d5d5d]" />
            <span className="text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
              {getAgeText(detail.birthDate)}
            </span>
          </div>

          {/* 상태 배지 */}
          <Badge variant="status" className="w-fit px-[0.585rem] py-[0.234rem] text-[0.819rem] leading-[1.286rem]">
            {ADOPTION_STATUS_LABEL[detail.status]}
          </Badge>

          {/* 설명 */}
          <p className="max-w-[34rem] text-[1.25rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {detail.description}
          </p>
        </div>

        {/* 하단: 통계 + 관심/공유 */}
        <div className="flex flex-col items-end gap-[0.375rem]">
          <ListingStats
            inquiryCount={detail.inquiryCount}
            favoriteCount={detail.favoriteCount}
            viewCount={detail.viewCount}
            size="lg"
          />
          <div className="flex items-center gap-[0.625rem]">
            <FavoriteButton size="sm" />
            <button
              type="button"
              className="flex items-center gap-[0.625rem] rounded-full p-[0.625rem] text-[0.875rem] font-medium text-[#5d5d5d]"
            >
              <ShareIcon className="size-[1.5rem]" />
              <span>공유</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export { PetInfoCard }

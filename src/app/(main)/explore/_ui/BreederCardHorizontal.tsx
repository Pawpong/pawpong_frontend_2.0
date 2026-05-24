'use client'

import Image from 'next/image'
import { Badge, FavoriteButton, ListingStats } from '@/shared/ui'
import type { ExploreBreeder } from '@/shared/mocks/breederExplore'

interface BreederCardHorizontalProps {
  breeder: ExploreBreeder
}

const BreederCardHorizontal = ({ breeder }: BreederCardHorizontalProps) => {
  return (
    <div className="flex items-center gap-[0.563rem] rounded-[0.375rem] bg-[#f0f0f0] px-[0.5rem] py-[0.438rem]">
      {/* 이미지 100x100 */}
      <div className="relative size-[6.25rem] shrink-0 overflow-hidden">
        {breeder.imageUrl && (
          <Image
            src={breeder.imageUrl}
            alt={breeder.nickname}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-[0.438rem]">
        {/* 이름 + 분양중 + 뱃지 */}
        <div className="flex flex-col gap-px">
          <p className="line-clamp-1 text-sm font-bold leading-[1.5] text-[#5d5d5d]">
            {breeder.nickname}
          </p>
          <div className="flex items-center gap-[0.313rem]">
            {breeder.isBreeding && (
              <Badge
                variant="status"
                className="h-[1.375rem] px-[0.5rem] py-[0.125rem] text-xs leading-[1.375rem]"
              >
                분양중
              </Badge>
            )}
            <div className="flex items-center gap-1">
              {breeder.badges.map((badge) => (
                <Badge
                  key={badge}
                  variant="outline"
                  className="h-6 text-xs leading-[1.375rem]"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 문의/관심/조회 + 즐겨찾기 */}
        <div className="flex flex-col items-end">
          <ListingStats
            inquiryCount={breeder.inquiryCount}
            favoriteCount={breeder.favoriteCount}
            viewCount={breeder.viewCount}
            size="sm"
            className="w-full justify-end"
          />
          <FavoriteButton size="sm" />
        </div>
      </div>
    </div>
  )
}

export { BreederCardHorizontal }

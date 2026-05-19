'use client'

import Image from 'next/image'
import { Badge } from '@/shared/ui'
import type { FavoriteBreeder } from '@/shared/mocks/myHome'

interface BreederCardProps {
  breeder: FavoriteBreeder
}

const BreederCard = ({ breeder }: BreederCardProps) => {
  return (
    <div className="flex w-[10.25rem] shrink-0 flex-col gap-[0.438rem] tab:w-[21.75rem] tab:gap-0 tab:overflow-hidden tab:rounded-[0.935rem] tab:bg-[#e7e7e7]">
      {/* Image Area */}
      <div className="relative h-[10.25rem] w-full overflow-hidden rounded-[0.375rem] bg-fill-placeholder tab:aspect-[348/290] tab:h-auto tab:rounded-none">
        {/* 분양중 badge — overlay */}
        {breeder.isBreeding && (
          <Badge
            variant="status"
            className="absolute left-[0.625rem] top-[0.766rem] px-[0.625rem] py-[0.25rem] text-xs leading-[1.375rem]"
          >
            분양중
          </Badge>
        )}

        {/* Star icon — overlay */}
        <button
          type="button"
          className="absolute right-[0.625rem] top-[0.766rem] tab:hidden"
          aria-label="즐겨찾기"
        >
          <Image src="/star.svg" alt="즐겨찾기" width={20} height={20} />
        </button>
      </div>

      {/* Info Area */}
      <div className="flex flex-col tab:px-[1.228rem] tab:pb-[0.709rem]">
        {/* Name + Status Badge (desktop) */}
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold leading-[1.375rem] text-text-primary tab:text-[1.169rem] tab:leading-[1.286rem]">
            {breeder.nickname}
          </p>
          {breeder.isBreeding && (
            <Badge
              variant="status"
              className="hidden px-[0.537rem] py-[0.215rem] text-[0.625rem] leading-[1.182rem] tab:inline-flex tab:text-xs tab:leading-[1.182rem]"
            >
              분양 진행중
            </Badge>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 tab:mt-1.5 tab:gap-3">
          {breeder.badges.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className="h-6 text-xs leading-[1.375rem] tab:text-sm"
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Location + Date (mobile only) */}
        <div className="flex items-center gap-[0.438rem] tab:hidden">
          <span className="text-xs font-normal leading-[1.375rem] text-[#a3a3a3]">
            {breeder.location}
          </span>
          <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
          <span className="text-xs font-normal leading-[1.375rem] text-[#a3a3a3]">
            {breeder.date}
          </span>
        </div>

        {/* Favorite Button (desktop only) */}
        <div className="mt-2 hidden justify-end tab:mt-3 tab:flex">
          <button
            type="button"
            className="flex items-center gap-[0.585rem] rounded-full p-[0.585rem]"
          >
            <Image src="/star.svg" alt="즐겨찾기" width={24} height={24} />
            <span className="text-[0.819rem] font-medium leading-none text-text-primary">
              즐겨찾기
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { BreederCard }

'use client'

import Link from 'next/link'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/Cn'
import type { ContestInfo } from '@/shared/types'

interface ContestBannerProps {
  contest: ContestInfo
}

const ContestBanner = ({ contest }: ContestBannerProps) => {
  return (
    <div className="relative rounded-2xl bg-[#ebebeb] px-5 pb-4 pt-3 tab:px-6 tab:pb-5 tab:pt-6">
      {/* 타이틀 */}
      <p
        className={cn(
          cafe24Proup.className,
          'font-cafe24 text-base leading-[1.4] text-[#5d5d5d] tab:text-2xl tab:leading-[1.5]',
        )}
      >
        {contest.title}
      </p>

      {/* 참여자 수 + 참여 혜택 (모바일에서는 같은 줄) */}
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-sm font-bold text-[#999] tab:text-xl tab:font-semibold tab:leading-[1.4]">
          이번주 참여자 : {contest.participantCount}명
        </p>
        <p className="text-xs font-medium text-[#999] tab:hidden">참여 혜택</p>
      </div>

      {/* 참여 혜택 - PC 우측 상단 */}
      <p className="absolute right-6 top-6 hidden text-sm font-semibold text-[#999] tab:block">
        참여 혜택
      </p>

      {/* 콘테스트 참여하기 버튼 */}
      <div className="mt-3 flex justify-center tab:justify-end">
        <Link
          href="/hall-of-fame/participate"
          className="flex h-10 w-[15.4375rem] items-center justify-center rounded-full bg-[#d4d4d4] p-[0.625rem] tab:h-12 tab:w-56"
        >
          <span className="whitespace-nowrap text-base font-semibold text-[#5d5d5d]">
            콘테스트 참여하기
          </span>
        </Link>
      </div>
    </div>
  )
}

export { ContestBanner }

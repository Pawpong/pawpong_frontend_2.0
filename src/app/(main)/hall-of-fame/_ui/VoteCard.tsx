'use client'

import Image from 'next/image'
import type { ContestEntry } from '@/shared/types'
import { VoteButton } from './VoteButton'

interface VoteCardProps {
  entry: ContestEntry
}

const VoteCard = ({ entry }: VoteCardProps) => {
  return (
    <div className="flex flex-col gap-1">
      {/* 이미지 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[0.375rem] tab:aspect-[4/3] tab:rounded-2xl tab:bg-[#e7e7e7]">
        <Image
          src={entry.imageUrl}
          alt={entry.description}
          fill
          className="object-cover"
        />
      </div>

      {/* 설명 */}
      <p className="line-clamp-2 text-sm font-semibold leading-[1.5] text-[#959595] tab:px-5 tab:pt-4 tab:font-bold">
        {entry.description}
      </p>

      {/* 모바일: 자세히 보기 + 투표 버튼 */}
      <div className="flex flex-col gap-1 tab:hidden">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-center rounded-full border border-[#5d5d5d] px-[0.875rem] py-1"
        >
          <span className="text-sm font-semibold leading-[1.375rem] text-[#5d5d5d]">
            자세히 보기
          </span>
        </button>
        <VoteButton
          isVoted={entry.isVoted}
          voteCount={entry.voteCount}
          label="투표"
          className="h-10 w-full px-[0.875rem]"
        />
      </div>

      {/* PC: 투표하기 버튼 */}
      <div className="hidden justify-center tab:flex tab:px-5 tab:pb-5">
        <VoteButton
          isVoted={entry.isVoted}
          voteCount={entry.voteCount}
          label="투표하기"
          className="w-[13.625rem]"
        />
      </div>
    </div>
  )
}

export { VoteCard }

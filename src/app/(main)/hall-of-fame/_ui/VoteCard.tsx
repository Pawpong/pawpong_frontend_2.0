'use client'

import Image from 'next/image'
import type { ContestEntry } from '@/shared/types'
import { VoteButton } from './VoteButton'

interface VoteCardProps {
  entry: ContestEntry
  onImageClick?: () => void
}

const VoteCard = ({ entry, onImageClick }: VoteCardProps) => {
  return (
    <div className="flex flex-col gap-1 tab:gap-0 tab:overflow-hidden tab:rounded-[0.936rem] tab:bg-[#e7e7e7]">
      {/* 이미지 */}
      <button
        type="button"
        onClick={onImageClick}
        className="relative aspect-square w-full overflow-hidden rounded-[0.375rem] tab:aspect-[4/3] tab:rounded-none"
      >
        <Image
          src={entry.photoUrl}
          alt={entry.description}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover"
        />
      </button>

      {/* 설명 */}
      <p className="line-clamp-2 text-sm leading-[1.5] font-semibold text-[#959595] tab:px-5 tab:pt-4 tab:font-bold">
        {entry.description}
      </p>

      {/* 모바일: 자세히 보기 + 투표 버튼 */}
      <div className="flex flex-col gap-1 tab:hidden">
        <button
          type="button"
          onClick={onImageClick}
          className="flex h-10 w-full items-center justify-center rounded-full border border-[#5d5d5d] px-[0.875rem] py-1"
        >
          <span className="text-sm leading-[1.375rem] font-semibold text-[#5d5d5d]">
            자세히 보기
          </span>
        </button>
        <VoteButton
          isVoted={entry.hasVoted}
          voteCount={entry.voteCount}
          label="투표"
          className="h-10 w-full px-[0.875rem]"
        />
      </div>

      {/* PC: 투표하기 버튼 */}
      <div className="hidden justify-center tab:mt-[1.875rem] tab:flex tab:px-5 tab:pb-5">
        <VoteButton
          isVoted={entry.hasVoted}
          voteCount={entry.voteCount}
          label="투표하기"
          className="w-[13.625rem]"
        />
      </div>
    </div>
  )
}

export { VoteCard }

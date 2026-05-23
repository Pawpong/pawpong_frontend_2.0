'use client'

import Image from 'next/image'
import { RankBadgeIcon } from '@/shared/assets/icons'
import { Avatar, AvatarFallback } from '@/shared/ui'
import type { ContestEntry } from '@/shared/types'

interface RankingCardProps {
  entry: ContestEntry
}

const RankingCard = ({ entry }: RankingCardProps) => {
  return (
    <>
      {/* 모바일: 가로형 리스트 카드 */}
      <div className="relative flex h-[7.125rem] gap-3 overflow-hidden rounded-[0.375rem] bg-[#f0f0f0] p-2 tab:hidden">
        {/* 이미지 */}
        <div className="relative size-[6.25rem] shrink-0 overflow-hidden rounded-[0.375rem]">
          <Image
            src={entry.imageUrl}
            alt={entry.description}
            fill
            className="object-cover"
          />
          {/* 랭킹 뱃지 */}
          {entry.rank && (
            <RankBadgeIcon
              rank={entry.rank as 1 | 2 | 3}
              className="absolute left-0 top-0 size-10"
            />
          )}
        </div>

        {/* 우측 텍스트 */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <p className="line-clamp-3 text-sm font-semibold leading-[1.5] text-[#959595]">
            {entry.description}
          </p>
          <div className="flex items-center gap-1.5">
            <Avatar size="xs">
              <AvatarFallback>
                {entry.participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold text-text-primary">
              {entry.participant.name}
            </span>
          </div>
        </div>
      </div>

      {/* PC: 세로형 카드 */}
      <div className="relative hidden overflow-hidden rounded-2xl bg-[#e7e7e7] tab:block">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={entry.imageUrl}
            alt={entry.description}
            fill
            className="object-cover"
          />
        </div>

        {/* 랭킹 뱃지 */}
        {entry.rank && (
          <RankBadgeIcon
            rank={entry.rank as 1 | 2 | 3}
            className="absolute left-3 top-2 size-[4.4rem]"
          />
        )}

        <div className="flex flex-col gap-3 p-5">
          <p className="line-clamp-2 text-sm font-bold leading-[1.5] text-[#959595]">
            {entry.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>
                  {entry.participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-text-primary">
                {entry.participant.name}
              </span>
            </div>
            <span className="text-sm font-bold text-[#959595]">{`홈가기 >`}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export { RankingCard }

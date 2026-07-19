'use client'

import Image from 'next/image'
import { useInfiniteQuery } from '@tanstack/react-query'
import { contestQueries } from '@/entities/contest'
import type { ContestEntry } from '@/shared/types'
import { Container, DetailLink, ProfileAvatar, SectionHeader } from '@/shared/ui'

const CARD_COUNT = 3

const PLACEHOLDER_TEXT =
  '명예의 전당 내용을 작성해주세요 명예의 전당 내용을 작성해주세요명예의 전당 내용을 작성해주세요명예의 전당 내용을 작성해주세요'

/** 아바타 + 이름 — large / md-avator 카드 공용 */
const CardProfile = ({ winner }: { winner?: ContestEntry }) => (
  <div className="flex items-center gap-[0.5rem]">
    <ProfileAvatar
      size="small"
      className="shrink-0"
      src={winner?.userProfileImageUrl ?? undefined}
      alt={winner?.userDisplayName}
    />
    <span className="text-[0.875rem] leading-[1.5] font-semibold text-text-primary">
      {winner?.userDisplayName ?? 'profile'}
    </span>
  </div>
)

/** 이미지 or 회색 스켈레톤 (winner 없을 때) */
const CardImage = ({ winner, className }: { winner?: ContestEntry; className?: string }) => (
  <div className={className}>
    {winner && (
      <Image src={winner.photoUrl} alt={winner.description} fill className="object-cover" />
    )}
  </div>
)

/** Figma card-vote: large — PC 세로형 (본문 14px + 브리더홈 링크) */
const HallOfFameCard = ({ winner }: { winner?: ContestEntry }) => (
  <div className="flex w-[17.625rem] shrink-0 flex-col">
    <CardImage
      winner={winner}
      className="relative aspect-[348/284] w-full overflow-hidden rounded-[0.5rem] bg-[#6b6b6b]"
    />
    <div className="flex flex-col gap-[0.75rem] p-[0.75rem]">
      <p className="line-clamp-2 text-[0.875rem] leading-[1.5] font-semibold text-[#6b6b6b]">
        {winner?.description ?? PLACEHOLDER_TEXT}
      </p>
      <div className="flex items-center justify-between">
        <CardProfile winner={winner} />
        <DetailLink
          href={winner ? `/home/${winner.userId}` : '/home'}
          label="브리더홈"
          size="md"
        />
      </div>
    </div>
  </div>
)

/** Figma card-vote: md-avator — 모바일·태블릿 가로형 (본문 12px, 링크 없음) */
const HallOfFameCardCompact = ({ winner }: { winner?: ContestEntry }) => (
  <div className="flex w-full items-center gap-[1rem] rounded-[0.5rem] bg-[#f6f6f6] p-[0.5rem]">
    <CardImage
      winner={winner}
      className="relative size-[6.875rem] shrink-0 overflow-hidden rounded-[0.25rem] bg-[#6b6b6b]"
    />
    <div className="flex flex-1 flex-col justify-between self-stretch">
      <p className="line-clamp-3 text-[0.75rem] leading-[1.5] font-semibold text-[#6b6b6b]">
        {winner?.description ?? PLACEHOLDER_TEXT}
      </p>
      <CardProfile winner={winner} />
    </div>
  </div>
)

const HallOfFame = () => {
  // 홈은 부분 실패 허용 — throwOnError만 꺼서 실패 시 스켈레톤 유지 (hall-of-fame 페이지는 기본 정책)
  const { data } = useInfiniteQuery({
    ...contestQueries.hallOfFame(CARD_COUNT),
    throwOnError: false,
  })
  const winners = (data?.pages[0]?.items ?? []).slice(0, CARD_COUNT).map((item) => item.winner)

  // 데이터 없으면(로딩/실패/빈 목록) 스켈레톤 카드 유지
  const cards: (ContestEntry | undefined)[] =
    winners.length > 0 ? winners : Array.from({ length: CARD_COUNT }, () => undefined)

  return (
    <Container className="py-6 tab:py-8 pc:py-12">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader title="명예의 전당" linkText="이번주 명예의 동물 투표하기" linkHref="/vote" />

        {/* 모바일·태블릿: 가로형 카드 세로 스택 (Figma 940-37598) */}
        <div className="flex flex-col gap-[0.75rem] pc:hidden">
          {cards.map((winner, i) => (
            <HallOfFameCardCompact key={winner?.id ?? i} winner={winner} />
          ))}
        </div>

        {/* PC: 세로형 카드 가운데 정렬, gap 80px (Figma 1555-88218) */}
        <div className="hidden flex-wrap items-start justify-center gap-[5rem] pc:flex">
          {cards.map((winner, i) => (
            <HallOfFameCard key={winner?.id ?? i} winner={winner} />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { HallOfFame }

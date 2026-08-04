'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { contestQueries } from '@/entities/contest'
import { MOCK_RANKING_ENTRIES } from '@/shared/mocks/hallOfFame'
import type { ContestEntry } from '@/shared/types'
import { Container, DetailLink, ImageDetailModal } from '@/shared/ui'
import { HallOfFamePodium } from './HallOfFamePodium'

const CARD_COUNT = 3

const HallOfFame = () => {
  const [selected, setSelected] = useState<ContestEntry | null>(null)

  const { data } = useInfiniteQuery({
    ...contestQueries.hallOfFame(CARD_COUNT),
    throwOnError: false,
  })
  const winners = (data?.pages[0]?.items ?? []).slice(0, CARD_COUNT).map((item) => item.winner)

  // ponytail SSL 인증서 복구 전 홈 UI 확인용 폴백
  const cards: (ContestEntry | undefined)[] = winners.length > 0 ? winners : MOCK_RANKING_ENTRIES

  return (
    <section className="w-full bg-white">
      <Container className="px-4 py-4 tab:py-[0.625rem] pc:h-[36rem] pc:py-20">
        <div className="flex w-full flex-col items-start gap-[0.625rem] tab:gap-4 pc:flex-row pc:gap-9">
          <div className="flex h-[2.625rem] w-full shrink-0 flex-row items-center justify-between gap-2 tab:h-[1.875rem] pc:h-auto pc:w-[12.75rem] pc:flex-col pc:items-start pc:justify-start">
            <h2 className="max-w-[12.9375rem] font-cafe24 text-sm leading-[1.5] font-normal text-neutral-850 tab:max-w-none tab:whitespace-nowrap pc:text-xl pc:whitespace-normal">
              <span className="block tab:inline pc:block">이번주 명예의 동물들을 </span>
              <span className="block tab:inline pc:block">소개합니다 !</span>
            </h2>
            <DetailLink
              href="/vote"
              label="명예의 동물 투표하기"
              size="sm"
              className="text-neutral-850 pc:text-sm"
            />
          </div>

          <HallOfFamePodium entries={cards} onEntryClick={setSelected} />
        </div>
      </Container>

      {selected && (
        <ImageDetailModal
          open
          onOpenChange={(open) => !open && setSelected(null)}
          images={[selected.photoUrl]}
          voteCount={selected.voteCount}
          showVoteStatus={selected.hasVoted}
          description={selected.description}
          profile={{
            nickname: selected.userDisplayName,
            avatarUrl: selected.userProfileImageUrl ?? undefined,
            homeHref: `/home/${selected.userId}`,
          }}
          showActions={false}
        />
      )}
    </section>
  )
}

export { HallOfFame }

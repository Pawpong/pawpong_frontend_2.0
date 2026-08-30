'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { contestQueries } from '@/entities/contest'
import type { ContestEntry } from '@/shared/types'
import { Container, DetailLink, ImageDetailModal, ListState } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { HallOfFamePodium } from './HallOfFamePodium'

const CARD_COUNT = 3

const HallOfFame = () => {
  const [selected, setSelected] = useState<ContestEntry | null>(null)

  const { data, isPending, isError } = useInfiniteQuery({
    ...contestQueries.hallOfFame(CARD_COUNT),
    throwOnError: false,
  })
  // [refactored] 손수 pages[0] 까던 것 → 기존 flattenPages 헬퍼로 통일
  const winners = flattenPages(data)
    .slice(0, CARD_COUNT)
    .map((item) => item.winner)

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
              href="/hall-of-fame"
              label="명예의 동물 투표하기"
              size="sm"
              className="text-neutral-850 pc:text-sm"
            />
          </div>

          <div className="w-full min-w-0 pc:flex-1">
            <ListState
              isPending={isPending}
              isError={isError}
              isEmpty={winners.length === 0}
              loadingText="명예의 동물을 불러오는 중입니다."
              errorText="명예의 동물을 불러오지 못했습니다."
              emptyText="아직 선정된 명예의 동물이 없습니다."
            >
              <HallOfFamePodium entries={winners} onEntryClick={setSelected} />
            </ListState>
          </div>
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

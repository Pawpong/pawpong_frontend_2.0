'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets/icons'
import { Container, SectionHeader } from '@/shared/ui'
import {
  MOCK_CONTEST_INFO,
  MOCK_RANKING_ENTRIES,
  MOCK_VOTE_ENTRIES,
} from '@/shared/mocks/hallOfFame'
import type { ContestEntry } from '@/shared/types'
import { ContestBanner } from './ContestBanner'
import { EntryDetailModal } from './EntryDetailModal'
import { RankingCard } from './RankingCard'
import { VoteCard } from './VoteCard'

type RankingPeriod = 'current' | 'previous'

const RANKING_PERIOD_CONFIG: Record<RankingPeriod, { title: string; buttonLabel: string; next: RankingPeriod }> = {
  current: { title: '실시간 랭킹 1위~3위', buttonLabel: '< 저번주 랭킹', next: 'previous' },
  previous: { title: '저번주 랭킹 1위~3위', buttonLabel: '이번주 랭킹>', next: 'current' },
}

const HallOfFameContent = () => {
  const [isRankingOpen, setIsRankingOpen] = useState(true)
  const [isVoteOpen, setIsVoteOpen] = useState(true)
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('current')
  const [selectedEntry, setSelectedEntry] = useState<ContestEntry | null>(null)

  const periodConfig = RANKING_PERIOD_CONFIG[rankingPeriod]

  return (
    <div className="flex w-full flex-col pb-12">
      {/* Navigation Header */}
      <Container>
        <div className="flex items-center gap-[0.625rem] py-3 tab:justify-center tab:pb-[2rem] tab:pt-[1.5rem]">
          <Link href="/home" className="flex items-center tab:flex-1">
            <ArrowBackIcon className="size-5 text-text-primary tab:size-6" />
          </Link>
          <h1 className="text-sm font-semibold leading-[1.5] text-text-primary tab:text-xl tab:font-bold tab:leading-[1.375rem]">
            명예의 전당
          </h1>
          <div className="hidden flex-1 tab:block" />
        </div>
      </Container>

      {/* Contest Banner */}
      <Container className="mt-2 tab:mt-6 pc:px-[12.25rem]">
        <ContestBanner contest={MOCK_CONTEST_INFO} />
      </Container>

      {/* Ranking Section */}
      <Container className="mt-6 tab:mt-16">
        <div className="flex flex-col gap-3 tab:gap-5">
          <SectionHeader
            title={periodConfig.title}
            subtitle={MOCK_CONTEST_INFO.dateRange}
            collapsible
            collapsed={!isRankingOpen}
            onToggle={() => setIsRankingOpen((prev) => !prev)}
            rightSlot={
              <button
                type="button"
                className="flex h-9 items-center justify-center rounded-full bg-[#a4a4a4] px-5"
                onClick={() => setRankingPeriod(periodConfig.next)}
              >
                <span className="whitespace-nowrap text-sm font-semibold text-white tab:text-base">
                  {periodConfig.buttonLabel}
                </span>
              </button>
            }
          />

          {/* 랭킹 카드 - 모바일: 세로 리스트 / PC: 3열 그리드 */}
          {isRankingOpen && (
            <div className="flex flex-col gap-3 tab:grid tab:grid-cols-3 tab:gap-5">
              {MOCK_RANKING_ENTRIES.map((entry) => (
                <RankingCard key={entry.entryId} entry={entry} onImageClick={() => setSelectedEntry(entry)} />
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* Vote Section */}
      <Container className="mt-6 tab:mt-16">
        <div className="flex flex-col gap-3 tab:gap-5">
          <SectionHeader
            title="투표하기"
            collapsible
            collapsed={!isVoteOpen}
            onToggle={() => setIsVoteOpen((prev) => !prev)}
          />

          {/* 투표 카드 - 2열 그리드 / PC: 3열 */}
          {isVoteOpen && (
            <div className="grid grid-cols-2 gap-4 tab:grid-cols-3 tab:gap-5">
              {MOCK_VOTE_ENTRIES.map((entry) => (
                <VoteCard key={entry.entryId} entry={entry} onImageClick={() => setSelectedEntry(entry)} />
              ))}
            </div>
          )}
        </div>
      </Container>

      <EntryDetailModal
        entry={selectedEntry}
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}
      />
    </div>
  )
}

export { HallOfFameContent }

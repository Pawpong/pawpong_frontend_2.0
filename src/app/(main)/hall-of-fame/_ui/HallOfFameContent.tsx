'use client'

import { Container, PageHeader, SectionHeader } from '@/shared/ui'
import {
  MOCK_CONTEST_INFO,
  MOCK_RANKING_ENTRIES,
  MOCK_VOTE_ENTRIES,
} from '@/shared/mocks/hallOfFame'
import { useHallOfFame } from '../_lib/useHallOfFame'
import { ContestBanner } from './ContestBanner'
import { EntryDetailModal } from './EntryDetailModal'
import { RankingCard } from './RankingCard'
import { VoteCard } from './VoteCard'

const HallOfFameContent = () => {
  const {
    isRankingOpen,
    isVoteOpen,
    periodConfig,
    selectedEntry,
    toggleRanking,
    toggleVote,
    switchPeriod,
    selectEntry,
    closeModal,
  } = useHallOfFame()

  return (
    <div className="flex w-full flex-col pb-12">
      <PageHeader title="명예의 전당" backHref="/home" />

      {/* Contest Banner */}
      <Container className="mt-2 tab:mt-6 pc:px-[12.25rem]">
        <ContestBanner contest={MOCK_CONTEST_INFO} userType="adopter" />
      </Container>

      {/* Ranking Section */}
      <Container className="mt-6 tab:mt-16">
        <div className="flex flex-col gap-3 tab:gap-5">
          <SectionHeader
            title={periodConfig.title}
            subtitle={MOCK_CONTEST_INFO.dateRange}
            collapsible
            collapsed={!isRankingOpen}
            onToggle={toggleRanking}
            rightSlot={
              <button
                type="button"
                className="flex h-9 items-center justify-center rounded-full bg-[#a4a4a4] px-5"
                onClick={switchPeriod}
              >
                <span className="whitespace-nowrap text-sm font-semibold text-white tab:text-base">
                  {periodConfig.buttonLabel}
                </span>
              </button>
            }
          />

          {isRankingOpen && (
            <div className="flex flex-col gap-3 tab:grid tab:grid-cols-3 tab:gap-5">
              {MOCK_RANKING_ENTRIES.map((entry) => (
                <RankingCard key={entry.entryId} entry={entry} onImageClick={() => selectEntry(entry)} />
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
            onToggle={toggleVote}
          />

          {isVoteOpen && (
            <div className="grid grid-cols-2 gap-4 tab:grid-cols-3 tab:gap-5">
              {MOCK_VOTE_ENTRIES.map((entry) => (
                <VoteCard key={entry.entryId} entry={entry} onImageClick={() => selectEntry(entry)} />
              ))}
            </div>
          )}
        </div>
      </Container>

      <EntryDetailModal
        entry={selectedEntry}
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) closeModal() }}
        userType="adopter"
      />
    </div>
  )
}

export { HallOfFameContent }

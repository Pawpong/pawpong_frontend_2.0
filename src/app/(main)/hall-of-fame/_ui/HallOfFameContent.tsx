'use client'

import { useMemo } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Container, ImageDetailModal, PageHeader, SectionHeader } from '@/shared/ui'
import { contestQueries } from '@/entities/contest'
import { useHallOfFameUI } from '../_lib/useHallOfFame'
import { ContestBanner } from './ContestBanner'
import { RankingCard } from './RankingCard'
import { VoteCard } from './VoteCard'

const HallOfFameContent = () => {
  const {
    isRankingOpen,
    isVoteOpen,
    rankingPeriod,
    periodConfig,
    selectedEntry,
    toggleRanking,
    toggleVote,
    switchPeriod,
    selectEntry,
    closeModal,
  } = useHallOfFameUI()

  const { data: currentContest } = useQuery(contestQueries.current())
  const {
    data: entriesData,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(contestQueries.entries())
  const { data: previousRanking } = useQuery(contestQueries.previousRanking())

  const ranking =
    rankingPeriod === 'current' ? (currentContest?.ranking ?? []) : (previousRanking?.ranking ?? [])

  const rankingDateRange = useMemo(() => {
    const contest = rankingPeriod === 'current' ? currentContest?.contest : previousRanking?.contest
    if (!contest) return ''
    const start = new Date(contest.startDate)
    const end = new Date(contest.endDate)
    return `${start.getMonth() + 1}.${start.getDate()} ~ ${end.getMonth() + 1}.${end.getDate()}`
  }, [rankingPeriod, currentContest, previousRanking])

  const entries = useMemo(
    () => entriesData?.pages.flatMap((page) => page.items) ?? [],
    [entriesData],
  )

  if (!currentContest) return null

  return (
    <div className="flex w-full flex-col pb-12">
      <PageHeader title="명예의 전당" backHref="/home" />

      {/* Contest Banner */}
      <Container className="mt-2 tab:mt-6 pc:px-[12.25rem]">
        <ContestBanner contest={currentContest.contest} userType="adopter" />
      </Container>

      {/* Ranking Section */}
      <Container className="mt-6 tab:mt-16">
        <div className="flex flex-col gap-3 tab:gap-5">
          <SectionHeader
            title={periodConfig.title}
            subtitle={rankingDateRange}
            collapsible
            collapsed={!isRankingOpen}
            onToggle={toggleRanking}
            rightSlot={
              <button
                type="button"
                className="flex h-9 items-center justify-center rounded-full bg-[#a4a4a4] px-5"
                onClick={switchPeriod}
              >
                <span className="text-body-s font-semibold whitespace-nowrap text-white">
                  {periodConfig.buttonLabel}
                </span>
              </button>
            }
          />

          {isRankingOpen && (
            <div className="flex flex-col gap-3 tab:grid tab:grid-cols-3 tab:gap-5">
              {ranking.map((entry) => (
                <RankingCard key={entry.id} entry={entry} onImageClick={() => selectEntry(entry)} />
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
            <>
              <div className="grid grid-cols-2 gap-4 tab:grid-cols-3 tab:gap-5">
                {entries.map((entry) => (
                  <VoteCard key={entry.id} entry={entry} onImageClick={() => selectEntry(entry)} />
                ))}
              </div>
              {hasNextPage && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="mx-auto mt-4 flex h-10 items-center justify-center rounded-full bg-[#e7e7e7] px-8"
                >
                  <span className="text-sm font-semibold text-[#5d5d5d]">더보기</span>
                </button>
              )}
            </>
          )}
        </div>
      </Container>

      {selectedEntry && (
        <ImageDetailModal
          open
          onOpenChange={(open) => {
            if (!open) closeModal()
          }}
          images={[selectedEntry.photoUrl]}
          voteCount={selectedEntry.voteCount}
          showVoteStatus={selectedEntry.hasVoted}
          description={selectedEntry.description}
          profile={{
            nickname: selectedEntry.userDisplayName,
            avatarUrl: selectedEntry.userProfileImageUrl ?? undefined,
            homeHref: `/home/${selectedEntry.userId}`,
          }}
          showActions={false}
        />
      )}
    </div>
  )
}

export { HallOfFameContent }

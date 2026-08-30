'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ArrowRightIcon } from '@/shared/assets'
import type { ContestEntry } from '@/shared/types'
import {
  Container,
  CtaModal,
  ImageDetailModal,
  InfiniteScrollTrigger,
  ListState,
  NavigationBar,
} from '@/shared/ui'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { ContestVoteCard, contestQueries } from '@/entities/contest'
import { useCancelContestVote, useVoteContestEntry } from '@/features/contest'
import { useAuthStatus } from '@/features/auth'
import { HallOfFamePodium } from '@/widgets/hall-of-fame'
import { flattenPages } from '@/shared/lib/infiniteList'

const PODIUM_COUNT = 3
const ENTRY_PAGE_SIZE = 16

const HallOfFameContent = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuthStatus()
  const [selectedEntry, setSelectedEntry] = useState<ContestEntry | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const {
    data: currentContest,
    isPending: isCurrentPending,
    isError: isCurrentError,
  } = useQuery({
    ...contestQueries.current(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const {
    data: hallOfFameData,
    isPending: isHallOfFamePending,
    isError: isHallOfFameError,
  } = useInfiniteQuery({
    ...contestQueries.hallOfFame(PODIUM_COUNT),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const {
    data: entriesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: areEntriesPending,
    isError: areEntriesError,
  } = useInfiniteQuery({
    ...contestQueries.entries(ENTRY_PAGE_SIZE),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const voteEntry = useVoteContestEntry()
  const cancelVote = useCancelContestVote()

  // 무한스크롤 페이지 병합 시 id 중복 제거 — 서버 페이지네이션이 경계에서 항목을
  // 겹쳐 주더라도 React key 중복(카드 중복/누락)이 발생하지 않도록 방어한다.
  const entries = useMemo(
    () => dedupeBy(flattenPages(entriesData), (entry) => entry.id),
    [entriesData],
  )
  const winners =
    // [refactored] 같은 파일에서 이미 쓰는 flattenPages로 통일
    flattenPages(hallOfFameData)
      .slice(0, PODIUM_COUNT)
      .map((item) => item.winner)
  const currentRanking = currentContest?.ranking.slice(0, PODIUM_COUNT) ?? []
  const podiumEntries: (ContestEntry | undefined)[] = Array.from(
    { length: PODIUM_COUNT },
    (_, index) => currentRanking[index] ?? winners[index],
  )
  // 비로그인은 투표 요청이 401로 떨어지므로 먼저 로그인으로 유도한다
  const handleVote = (entryId: string) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }
    voteEntry.mutate(entryId)
  }

  const handleCancelVote = (entryId: string) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }
    cancelVote.mutate(entryId)
  }

  // 진행 중인 콘테스트가 없으면 서버가 current=null, entries=[]로 응답한다.
  const hasNoContest = currentContest === null
  const hasPodiumEntry = podiumEntries.some(Boolean)

  const votedEntryId =
    currentContest?.myVotedEntryId ?? entries.find((entry) => entry.hasVoted)?.id ?? null
  const hasContestVote = votedEntryId !== null

  return (
    <div className="flex w-full flex-col bg-base-white pb-12">
      <NavigationBar title="명예의 전당" backHref="/" />

      <section className="w-full">
        <Container className="px-4 py-4 tab:px-12 tab:py-10 pc:max-w-[80rem] pc:px-0">
          <div className="flex w-full flex-col items-start gap-2.5 tab:gap-4 pc:flex-row pc:gap-9">
            <div className="flex w-full shrink-0 items-center justify-between gap-2 tab:h-[3.75rem] pc:h-[6.875rem] pc:w-[12.75rem] pc:flex-col pc:items-start">
              <h2 className="font-cafe24 text-sm leading-[1.5] font-normal text-neutral-850 tab:text-base pc:w-[12.75rem] pc:text-xl">
                <span className="block tab:inline pc:block">
                  {hasNoContest ? '역대 명예의 동물들을 ' : '이번주 명예의 동물들을 '}
                </span>
                <span className="block tab:inline pc:block">소개합니다 !</span>
              </h2>

              {/* 모바일은 한 줄에 안 들어가서 제목과 같은 지점에서 두 줄로 끊고,
                  화살표는 마지막 줄 끝에 붙여 흐르게 둔다 (세로 가운데 띄우면 어색) */}
              {currentContest && (
                <Link
                  href="/hall-of-fame/participate"
                  className="text-right text-xs leading-[1.5] font-semibold text-[#c75a00] tab:text-left pc:w-[9.0625rem]"
                >
                  이번주 명예의 전당{' '}
                  <span className="block tab:inline pc:block">
                    주인공이 되어보세요!
                    <ArrowRightIcon className="inline size-4 align-middle" />
                  </span>
                </Link>
              )}
            </div>

            <div className="w-full min-w-0 pc:flex-1">
              <ListState
                isPending={isCurrentPending || isHallOfFamePending}
                isError={!hasPodiumEntry && (isCurrentError || isHallOfFameError)}
                isEmpty={!hasPodiumEntry}
                loadingText="명예의 동물을 불러오는 중입니다."
                errorText="명예의 동물을 불러오지 못했습니다."
                emptyText="아직 선정된 명예의 동물이 없습니다."
              >
                <HallOfFamePodium
                  entries={podiumEntries}
                  onEntryClick={setSelectedEntry}
                  className="pc:h-[26rem]"
                />
              </ListState>
            </div>
          </div>
        </Container>
      </section>

      <section className="w-full">
        <Container className="px-5 pt-6 pb-12 tab:px-12 tab:pt-10 pc:max-w-[74.625rem] pc:px-0">
          <h2 className="mb-3 text-sm leading-[1.5] font-semibold text-neutral-850 tab:text-base pc:text-xl pc:leading-[1.4]">
            이번주 명예의 동물 투표하기
          </h2>

          <ListState
            isPending={areEntriesPending}
            isError={areEntriesError && !hasNoContest}
            isEmpty={entries.length === 0}
            loadingText="투표 후보를 불러오는 중입니다."
            errorText="투표 후보를 불러오지 못했습니다."
            emptyText={
              hasNoContest ? '진행 중인 콘테스트가 없습니다.' : '아직 등록된 투표 후보가 없습니다.'
            }
          >
            <>
              <div className="grid grid-cols-2 gap-4 tab:grid-cols-3 tab:gap-5 pc:grid-cols-4">
                {entries.map((entry) => {
                  const isVoted = entry.id === votedEntryId
                  const cardEntry =
                    entry.hasVoted === isVoted ? entry : { ...entry, hasVoted: isVoted }

                  return (
                    <ContestVoteCard
                      key={entry.id}
                      entry={cardEntry}
                      type="md"
                      responsive
                      showProfile={false}
                      hasContestVote={hasContestVote}
                      isVoting={
                        (voteEntry.isPending && voteEntry.variables === entry.id) ||
                        (cancelVote.isPending && cancelVote.variables === entry.id)
                      }
                      isVoteDisabled={voteEntry.isPending || cancelVote.isPending}
                      onVote={() => handleVote(entry.id)}
                      onCancelVote={() => handleCancelVote(entry.id)}
                      onImageClick={() => setSelectedEntry(cardEntry)}
                    />
                  )
                })}
              </div>

              {(voteEntry.isError || cancelVote.isError) && (
                <p role="alert" className="mt-4 text-center text-sm text-error-600">
                  투표를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}

              <InfiniteScrollTrigger
                onIntersect={() => void fetchNextPage()}
                hasNextPage={hasNextPage ?? false}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          </ListState>
        </Container>
      </section>

      <CtaModal
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        title="로그인이 필요해요"
        description="로그인하고 이번주 명예의 동물에게 투표해보세요."
        actions={[
          {
            label: '로그인하러 가기',
            variant: 'fill',
            // returnUrl은 /login → 백엔드 OAuth → /login/success 까지 그대로 전달돼 이 페이지로 되돌아온다
            onClick: () => router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`),
          },
          { label: '닫기', variant: 'ghost', onClick: () => setShowLoginPrompt(false) },
        ]}
      />

      {selectedEntry && (
        <ImageDetailModal
          open
          onOpenChange={(open) => {
            if (!open) setSelectedEntry(null)
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

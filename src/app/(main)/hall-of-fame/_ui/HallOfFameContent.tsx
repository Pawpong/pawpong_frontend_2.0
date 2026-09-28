'use client'

import Link from 'next/link'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { CommunityHallOfFame } from '@/shared/types'
import { ArrowRightIcon } from '@/shared/assets'
import { Container, InfiniteScrollTrigger, ListState, NavigationBar } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { communityQueries, formatHallOfFamePeriod } from '@/entities/community'
import { contestQueries } from '@/entities/contest'
import { HallOfFamePodium, PodiumCard, toRankSlots } from '@/widgets/hall-of-fame'

const HISTORY_PAGE_SIZE = 10

const PastPeriod = ({ hallOfFame }: { hallOfFame: CommunityHallOfFame }) => {
  const { year, title, range } = formatHallOfFamePeriod(hallOfFame)

  const isEmpty = hallOfFame.winners.length === 0

  return (
    <article
      aria-labelledby={`period-${hallOfFame.periodKey}`}
      className="min-w-0 pc:grid pc:grid-cols-[12.75rem_minmax(0,1fr)] pc:gap-9"
    >
      <header className="mb-4 flex items-center justify-between gap-4 pc:mb-0 pc:flex-col pc:items-start pc:justify-start pc:pt-6">
        <div className="flex items-baseline gap-3 pc:flex-col pc:gap-2">
          <span className="text-body-sm font-medium text-primary-600">{year}</span>
          <h3
            id={`period-${hallOfFame.periodKey}`}
            className="font-cafe24 text-body-lg text-neutral-850 tab:text-body-xl"
          >
            {title}
          </h3>
        </div>
        <p className="text-body-sm text-neutral-600">{range}</p>
      </header>

      {isEmpty ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-base-white/60 px-5 py-6 pc:my-2">
          <span className="text-body-md font-medium text-neutral-700">잠시 쉬어간 회차</span>
          <p className="text-body-sm text-neutral-600">이 회차에는 선정된 동물이 없어요.</p>
        </div>
      ) : (
        <div className="min-w-0 rounded-xl bg-secondary-100">
          <ol
            aria-label={`${year}년 ${title} 수상 동물`}
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-9 pb-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 tab:justify-center tab:gap-6 tab:px-6 tab:pt-10 tab:pb-8 pc:gap-8 pc:py-10"
          >
            {toRankSlots(hallOfFame.winners).map(({ rank, winner }) => (
              <li key={rank} className="shrink-0 snap-center">
                <PodiumCard rank={rank} winner={winner} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  )
}

const HallOfFameContent = () => {
  const current = useQuery({ ...communityQueries.hallOfFameCurrent(), throwOnError: false })
  // 콘테스트 참여 화면은 유지한다 — 진행 중인 콘테스트가 있을 때만 진입점을 노출
  const { data: currentContest } = useQuery({ ...contestQueries.current(), throwOnError: false })
  const history = useInfiniteQuery({
    ...communityQueries.hallOfFameHistory(HISTORY_PAGE_SIZE),
    throwOnError: false,
  })

  const winners = current.data?.winners ?? []
  const period = current.data && formatHallOfFamePeriod(current.data)
  const pastPeriods = flattenPages(history.data)

  return (
    <div className="flex w-full flex-col bg-base-white">
      <NavigationBar title="명예의 전당" titleVariant="page" />

      <section className="w-full">
        <Container className="px-4 py-4 tab:px-12 tab:py-10 pc:max-w-[80rem] pc:px-0">
          <div className="flex w-full flex-col items-start gap-2.5 tab:gap-4 pc:flex-row pc:gap-9">
            <div className="flex w-full shrink-0 flex-col gap-1 pc:w-min pc:min-w-[12.75rem]">
              <h2 className="font-cafe24 text-sm leading-[1.5] font-normal text-neutral-850 tab:text-base pc:text-xl pc:whitespace-nowrap">
                <span className="block tab:inline pc:block">이번 회차 명예의 동물들을 </span>
                <span className="block tab:inline pc:block">소개합니다 !</span>
              </h2>
              {period && (
                <p className="text-xs leading-[1.5] font-medium text-neutral-500 pc:text-sm">
                  {period.summary}
                </p>
              )}
              <p className="text-xs leading-[1.5] text-neutral-500">
                커뮤니티에서 좋아요를 가장 많이 받은 글이 선정돼요. 매시 정각 갱신
              </p>
              {currentContest && (
                <Link
                  href="/hall-of-fame/participate"
                  className="mt-1 flex items-center text-xs leading-[1.5] font-semibold text-[#c75a00]"
                >
                  콘테스트 참여하기
                  <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </div>

            <div className="w-full min-w-0 pc:flex-1">
              <ListState
                isPending={current.isPending}
                isError={current.isError}
                isEmpty={winners.length === 0}
                loadingText="명예의 동물을 불러오는 중입니다."
                errorText="명예의 동물을 불러오지 못했습니다."
                emptyText="이번 회차는 아직 집계 중이에요. 커뮤니티에 자랑글을 올려보세요!"
              >
                <HallOfFamePodium winners={winners} className="pc:h-[26rem]" />
              </ListState>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="hall-of-fame-history" className="w-full bg-secondary-50">
        <Container className="px-4 py-10 tab:px-12 tab:py-14 pc:max-w-[80rem] pc:px-0">
          <div className="mb-8 flex flex-col gap-3 tab:mb-12">
            <h2 id="hall-of-fame-history" className="font-cafe24 text-body-xl text-neutral-850">
              지난 명예의 전당
            </h2>
            <p className="text-body-md text-neutral-700">
              오래도록 기억하고 싶은, <br className="tab:hidden" />
              많은 사랑을 받은 동물들을 만나보세요.
            </p>
          </div>

          <ListState
            isPending={history.isPending}
            isError={history.isError}
            isEmpty={pastPeriods.length === 0}
            loadingText="지난 명예의 전당을 불러오는 중입니다."
            errorText="지난 명예의 전당을 불러오지 못했습니다."
            emptyText="아직 지난 회차가 없습니다."
          >
            <div className="flex flex-col gap-10 tab:gap-12">
              {pastPeriods.map((hallOfFame) => (
                <PastPeriod key={hallOfFame.periodKey} hallOfFame={hallOfFame} />
              ))}
            </div>
            <InfiniteScrollTrigger
              onIntersect={() => void history.fetchNextPage()}
              hasNextPage={history.hasNextPage}
              isFetchingNextPage={history.isFetchingNextPage}
            />
          </ListState>
        </Container>
      </section>
    </div>
  )
}

export { HallOfFameContent }

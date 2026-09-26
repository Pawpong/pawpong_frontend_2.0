'use client'

import Link from 'next/link'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { CommunityHallOfFame } from '@/shared/types'
import { ArrowRightIcon, FavoriteIcon } from '@/shared/assets'
import { Container, InfiniteScrollTrigger, ListState, NavigationBar } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { CommunityMediaCard, communityQueries, formatHallOfFamePeriod } from '@/entities/community'
import { contestQueries } from '@/entities/contest'
import { HallOfFamePodium } from '@/widgets/hall-of-fame'

const HISTORY_PAGE_SIZE = 10

const PastPeriod = ({ hallOfFame }: { hallOfFame: CommunityHallOfFame }) => {
  const { title, range } = formatHallOfFamePeriod(hallOfFame)

  return (
    <article className="flex flex-col gap-3 border-t border-neutral-200 pt-5 pc:pt-6">
      <h3 className="flex items-baseline gap-2">
        <span className="text-sm leading-[1.5] font-semibold text-neutral-850 pc:text-base">
          {title}
        </span>
        <span className="text-xs leading-[1.5] text-neutral-500 pc:text-sm">{range}</span>
      </h3>

      {hallOfFame.winners.length === 0 ? (
        <p className="text-sm leading-[1.5] text-neutral-500">이 회차에는 선정된 동물이 없어요.</p>
      ) : (
        <ol className="grid grid-cols-3 gap-2.5 tab:gap-4 pc:max-w-[48rem] pc:gap-5">
          {hallOfFame.winners.map((winner) => (
            <li key={winner.postId} className="flex min-w-0 flex-col gap-1.5">
              <CommunityMediaCard
                href={`/community/post/${winner.postId}`}
                imageUrl={winner.photoUrl ?? undefined}
                imageCount={0}
                alt={`${winner.rank}위 ${winner.author.nickname}`}
                className="aspect-square size-auto w-full"
              />
              <div className="flex min-w-0 items-center gap-1 text-xs leading-[1.5] pc:text-sm">
                <span className="shrink-0 font-semibold text-primary-500">{winner.rank}위</span>
                <span className="min-w-0 flex-1 truncate font-medium text-neutral-850">
                  {winner.author.nickname}
                </span>
                <span className="flex shrink-0 items-center gap-0.5 text-neutral-500">
                  <FavoriteIcon className="size-4" aria-hidden="true" />
                  <span className="sr-only">좋아요</span>
                  {winner.likeCount}
                </span>
              </div>
            </li>
          ))}
        </ol>
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
    <div className="flex w-full flex-col bg-base-white pb-12">
      <NavigationBar title="명예의 전당" titleVariant="page" />

      <section className="w-full">
        <Container className="px-4 py-4 tab:px-12 tab:py-10 pc:max-w-[80rem] pc:px-0">
          <div className="flex w-full flex-col items-start gap-2.5 tab:gap-4 pc:flex-row pc:gap-9">
            <div className="flex w-full shrink-0 flex-col gap-1 pc:w-[12.75rem]">
              <h2 className="font-cafe24 text-sm leading-[1.5] font-normal text-neutral-850 tab:text-base pc:text-xl">
                <span className="block tab:inline pc:block">이번 회차 명예의 동물들을 </span>
                <span className="block tab:inline pc:block">소개합니다 !</span>
              </h2>
              {period && (
                <p className="text-xs leading-[1.5] font-medium text-neutral-500 pc:text-sm">
                  {period.title} · {period.range}
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

      <section className="w-full">
        <Container className="px-5 pt-6 pb-12 tab:px-12 tab:pt-10 pc:max-w-[80rem] pc:px-0">
          <h2 className="mb-3 text-sm leading-[1.5] font-semibold text-neutral-850 pc:text-base pc:leading-[1.4]">
            지난 명예의 전당
          </h2>

          <ListState
            isPending={history.isPending}
            isError={history.isError}
            isEmpty={pastPeriods.length === 0}
            loadingText="지난 명예의 전당을 불러오는 중입니다."
            errorText="지난 명예의 전당을 불러오지 못했습니다."
            emptyText="아직 지난 회차가 없습니다."
          >
            <div className="flex flex-col gap-6">
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

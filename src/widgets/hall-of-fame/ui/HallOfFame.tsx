'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { communityQueries, formatHallOfFamePeriod } from '@/entities/community'
import type { CommunityHallOfFame } from '@/shared/types/CommunityTypes'
import { Container, DetailLink, ListState } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { cn } from '@/shared/lib/cn'
import { HallOfFamePodium } from './HallOfFamePodium'

/** 폴백으로 되짚어 볼 지난 회차 수 — 한 달이 3회차라 한 달 남짓을 본다. */
const HISTORY_FALLBACK_SIZE = 4

/** 수상작이 하나라도 남아 있는 회차인지 — 열람 불가로 빠진 순위도 보여줄 내용으로 센다. */
const hasAnyWinner = (period: CommunityHallOfFame) =>
  period.winners.length > 0 || Boolean(period.unavailableRanks?.length)

const HallOfFame = () => {
  const current = useQuery({ ...communityQueries.hallOfFameCurrent(), throwOnError: false })
  const isCurrentEmpty =
    current.data?.winners.length === 0 && !current.data?.unavailableRanks?.length
  // 서버는 회차 초반 빈 회차를 폴백하지 않으므로, 홈에서는 지난 확정 회차를 대신 보여준다.
  // 글이 없던 회차는 수상작 0건으로 확정되므로 직전 한 회차만 보면 그 빈 회차에 막혀
  // 홈의 명예의 전당이 통째로 비어 보인다. 몇 회차를 받아 수상작이 남은 첫 회차를 쓴다.
  const history = useInfiniteQuery({
    ...communityQueries.hallOfFameHistory(HISTORY_FALLBACK_SIZE),
    enabled: isCurrentEmpty,
    throwOnError: false,
  })

  const hallOfFame = isCurrentEmpty ? flattenPages(history.data).find(hasAnyWinner) : current.data
  const winners = hallOfFame?.winners ?? []
  const hasWinners = Boolean(hallOfFame && hasAnyWinner(hallOfFame))
  const period = hallOfFame && formatHallOfFamePeriod(hallOfFame)

  return (
    <section className="w-full bg-white">
      <Container className={cn('py-4 tab:py-[0.625rem] pc:py-10', hasWinners && 'pc:h-[31rem]')}>
        <div
          className={cn(
            'flex w-full flex-col items-start gap-[0.625rem] tab:gap-4',
            hasWinners && 'pc:flex-row pc:gap-9',
          )}
        >
          <div className="flex w-full shrink-0 flex-row items-end justify-between gap-2 pc:h-auto pc:w-auto pc:min-w-[12.75rem] pc:flex-col pc:items-start pc:justify-start">
            <div className="flex flex-col gap-1">
              <h2 className="max-w-[12.9375rem] font-cafe24 text-lg leading-[1.5] font-normal text-neutral-850 tab:max-w-none tab:whitespace-nowrap pc:text-xl">
                <span className="block tab:inline pc:block">
                  {isCurrentEmpty ? '지난 회차 명예의 동물들을 ' : '이번 회차 명예의 동물들을 '}
                </span>
                <span className="block tab:inline pc:block">소개합니다 !</span>
              </h2>
              {period && hasWinners && (
                <p className="text-xs leading-[1.5] font-medium text-neutral-500 pc:text-sm">
                  {period.summary}
                </p>
              )}
            </div>
            <DetailLink
              href="/hall-of-fame"
              label="명예의 전당 둘러보기"
              size="sm"
              className="shrink-0 pl-0 text-neutral-850 pc:text-sm"
            />
          </div>

          <div className="w-full min-w-0 pc:flex-1">
            <ListState
              isPending={current.isPending || (isCurrentEmpty && history.isPending)}
              isError={current.isError || (isCurrentEmpty && history.isError)}
              isEmpty={!hasWinners}
              loadingText="명예의 동물을 불러오는 중입니다."
              errorText="명예의 동물을 불러오지 못했습니다."
              emptyText="아직 선정된 명예의 동물이 없습니다."
            >
              <HallOfFamePodium
                winners={winners}
                state={hallOfFame?.state ?? 'open'}
                unavailableRanks={hallOfFame?.unavailableRanks}
              />
            </ListState>
          </div>
        </div>
      </Container>
    </section>
  )
}

export { HallOfFame }

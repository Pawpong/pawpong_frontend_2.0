import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import {
  getCurrentContest,
  getContestEntries,
  getMyContestEntry,
  getPreviousRanking,
  getRandomContestEntry,
  getContestWeeklyTop,
  getContestYesterdayTop,
  getHallOfFame,
} from './contest.api'

export const contestQueries = {
  all: () => ['contest'] as const,

  current: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'current'],
      queryFn: () => getCurrentContest(),
      staleTime: STALE_TIME.REALTIME,
    }),

  entries: (limit = 15) =>
    createInfiniteQuery({
      queryKey: [...contestQueries.all(), 'entries', limit],
      queryFn: (page) => getContestEntries({ page, limit }),
      staleTime: STALE_TIME.REALTIME,
    }),

  myEntry: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'myEntry'],
      queryFn: () => getMyContestEntry(),
      staleTime: STALE_TIME.DEFAULT,
    }),

  previousRanking: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'previousRanking'],
      queryFn: () => getPreviousRanking(),
      staleTime: STALE_TIME.LONG,
    }),

  hallOfFame: (limit = 15) =>
    createInfiniteQuery({
      queryKey: [...contestQueries.all(), 'hallOfFame', limit],
      queryFn: (page) => getHallOfFame({ page, limit }),
      staleTime: STALE_TIME.LONG,
    }),

  randomEntry: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'randomEntry'],
      queryFn: () => getRandomContestEntry(),
      staleTime: STALE_TIME.REALTIME,
    }),

  weeklyTop: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'weeklyTop'],
      queryFn: () => getContestWeeklyTop(),
      staleTime: STALE_TIME.LONG,
    }),

  yesterdayTop: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'yesterdayTop'],
      queryFn: () => getContestYesterdayTop(),
      staleTime: STALE_TIME.LONG,
    }),
}

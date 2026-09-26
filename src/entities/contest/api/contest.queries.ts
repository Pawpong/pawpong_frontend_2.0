import { createQuery, STALE_TIME } from '@/shared/api'
import {
  getCurrentContest,
  getMyContestEntry,
  getPreviousRanking,
  getRandomContestEntry,
  getContestWeeklyTop,
  getContestYesterdayTop,
} from './contest.api'

export const contestQueries = {
  all: () => ['contest'] as const,

  current: () =>
    createQuery({
      queryKey: [...contestQueries.all(), 'current'],
      queryFn: () => getCurrentContest(),
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

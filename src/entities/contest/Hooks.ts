'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { contestQueries } from './Queries'

export const useCurrentContest = () => useQuery(contestQueries.current())

export const useContestEntries = (limit?: number) =>
  useInfiniteQuery(contestQueries.entries(limit))

export const useMyContestEntry = () => useQuery(contestQueries.myEntry())

export const usePreviousRanking = () => useQuery(contestQueries.previousRanking())

export const useHallOfFame = (limit?: number) => useInfiniteQuery(contestQueries.hallOfFame(limit))

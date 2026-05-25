'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { profileQueries } from './Queries'

export const useMyProfile = () => useQuery(profileQueries.me())

export const useFavoriteBreeders = (pageSize?: number) =>
  useInfiniteQuery(profileQueries.favoriteBreeders(pageSize))

'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { adopterQueries } from './Queries'

export const useAdopterProfile = () => useQuery(adopterQueries.profile())

export const useFavorites = (limit?: number) => useInfiniteQuery(adopterQueries.favorites(limit))

export const useMyReviews = (limit?: number) => useInfiniteQuery(adopterQueries.reviews(limit))

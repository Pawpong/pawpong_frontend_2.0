'use client'

import { useQuery } from '@tanstack/react-query'
import { homeQueries } from './Queries'

export const useBanners = () => useQuery(homeQueries.banners())
export const useAdopterFaqs = () => useQuery(homeQueries.adopterFaqs())
export const useBreederFaqs = () => useQuery(homeQueries.breederFaqs())
export const useAvailablePets = (limit?: number) => useQuery(homeQueries.availablePets(limit))

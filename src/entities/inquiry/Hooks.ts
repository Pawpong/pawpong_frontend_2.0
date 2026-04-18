'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { inquiryQueries } from './Queries'
import type { AnimalType, InquirySortType } from '@/shared/types'

export const useInquiries = (animalType: AnimalType, sort: InquirySortType) =>
  useInfiniteQuery(inquiryQueries.list(animalType, sort))

export const useInquiryDetail = (inquiryId: string) => useQuery(inquiryQueries.detail(inquiryId))

export const useBreederInquiries = (answered: boolean) =>
  useInfiniteQuery(inquiryQueries.breederList(answered))

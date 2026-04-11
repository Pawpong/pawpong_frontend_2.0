'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inquiryQueries } from './queries'
import { createInquiry, createInquiryAnswer } from './api'
import type { AnimalType, InquirySortType, CreateInquiryRequest } from '@/shared/types'

export const useInquiries = (animalType: AnimalType, sort: InquirySortType) =>
  useInfiniteQuery(inquiryQueries.list(animalType, sort))

export const useInquiryDetail = (inquiryId: string) => useQuery(inquiryQueries.detail(inquiryId))

export const useBreederInquiries = (answered: boolean) =>
  useInfiniteQuery(inquiryQueries.breederList(answered))

export const useCreateInquiry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInquiryRequest) => createInquiry(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}

export const useCreateInquiryAnswer = (inquiryId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createInquiryAnswer(inquiryId, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.detail(inquiryId).queryKey })
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}

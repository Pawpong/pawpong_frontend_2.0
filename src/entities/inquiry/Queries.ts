import { createQuery, createInfiniteQueryWithHasMore } from '@/shared/api'
import type { AnimalType, InquirySortType } from '@/shared/types'
import { getInquiries, getInquiryDetail, getBreederInquiries } from './Api'

export const inquiryQueries = {
  all: () => ['inquiry'] as const,

  list: (animalType: AnimalType, sort: InquirySortType) =>
    createInfiniteQueryWithHasMore({
      queryKey: [...inquiryQueries.all(), 'list', animalType, sort],
      queryFn: (page) => getInquiries(page, animalType, sort),
    }),

  detail: (inquiryId: string) =>
    createQuery({
      queryKey: [...inquiryQueries.all(), 'detail', inquiryId],
      queryFn: () => getInquiryDetail(inquiryId),
      enabled: !!inquiryId,
    }),

  breederList: (answered: boolean) =>
    createInfiniteQueryWithHasMore({
      queryKey: [...inquiryQueries.all(), 'breeder', answered],
      queryFn: (page) => getBreederInquiries(answered, page),
    }),
}

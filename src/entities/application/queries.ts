import { createQuery, createInfiniteQuery } from '@/shared/api'
import type { ApplicationListItemDto } from '@/shared/types'
import { getMyApplications, getApplicationDetail, getApplicationForm } from './api'

export const applicationQueries = {
  all: () => ['application'] as const,

  myList: (animalType?: 'cat' | 'dog', limit = 10) =>
    createInfiniteQuery<ApplicationListItemDto>({
      queryKey: [...applicationQueries.all(), 'my-list', animalType, limit],
      queryFn: (page) => getMyApplications(page, limit, animalType),
    }),

  detail: (applicationId: string) =>
    createQuery({
      queryKey: [...applicationQueries.all(), 'detail', applicationId],
      queryFn: () => getApplicationDetail(applicationId),
      enabled: !!applicationId,
    }),

  form: () =>
    createQuery({
      queryKey: [...applicationQueries.all(), 'form'],
      queryFn: getApplicationForm,
    }),
}

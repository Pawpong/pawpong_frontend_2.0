import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { ApplicationListItemDto } from '@/shared/types'
import {
  getMyApplications,
  getApplicationDetail,
  getApplicationDraft,
  getApplicationForm,
} from './application.api'

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

  // 다른 기기에서 저장했을 수 있어 신청서를 열 때마다 새로 받는다
  draft: (petId: string) =>
    createQuery({
      queryKey: [...applicationQueries.all(), 'draft', petId],
      queryFn: () => getApplicationDraft(petId),
      enabled: !!petId,
      staleTime: STALE_TIME.REALTIME,
      // 불러오지 못해도 빈 신청서로 쓰면 된다 — 화면을 막지 않는다
      throwOnError: false,
    }),
}

import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type {
  SearchBreederParams,
  Breeder,
  AvailablePetSummaryDto,
  ParentPetSummaryDto,
  PublicReviewDto,
  ReceivedApplicationItemDto,
} from '@/shared/types'
import {
  getBreederProfile,
  getMyBreederProfile,
  getBreederDashboard,
  exploreBreeders,
  getPopularBreeders,
  getBreederPets,
  getParentPets,
  getBreederReviews,
  getBreederApplicationForm,
  getReceivedApplications,
  getReceivedApplicationDetail,
  getApplicationChatMessages,
} from './api'

export const breederQueries = {
  all: () => ['breeder'] as const,

  profile: (breederId: string) =>
    createQuery({
      queryKey: [...breederQueries.all(), 'profile', breederId],
      queryFn: () => getBreederProfile(breederId),
      enabled: !!breederId,
    }),

  myProfile: () =>
    createQuery({
      queryKey: [...breederQueries.all(), 'my-profile'],
      queryFn: getMyBreederProfile,
    }),

  dashboard: () =>
    createQuery({
      queryKey: [...breederQueries.all(), 'dashboard'],
      queryFn: getBreederDashboard,
    }),

  explore: (params: SearchBreederParams) =>
    createInfiniteQuery<Breeder>({
      queryKey: [...breederQueries.all(), 'explore', params],
      queryFn: (page) => exploreBreeders({ ...params, page }),
    }),

  popular: () =>
    createQuery({
      queryKey: [...breederQueries.all(), 'popular'],
      queryFn: getPopularBreeders,
      staleTime: STALE_TIME.LONG,
    }),

  pets: (breederId: string, limit = 20) =>
    createInfiniteQuery<AvailablePetSummaryDto>({
      queryKey: [...breederQueries.all(), 'pets', breederId, limit],
      queryFn: (page) => getBreederPets(breederId, page, limit),
      enabled: !!breederId,
    }),

  parentPets: (breederId: string, limit = 4) =>
    createInfiniteQuery<ParentPetSummaryDto>({
      queryKey: [...breederQueries.all(), 'parent-pets', breederId, limit],
      queryFn: (page) => getParentPets(breederId, page, limit),
      enabled: !!breederId,
    }),

  reviews: (breederId: string, limit = 10) =>
    createInfiniteQuery<PublicReviewDto>({
      queryKey: [...breederQueries.all(), 'reviews', breederId, limit],
      queryFn: (page) => getBreederReviews(breederId, page, limit),
      enabled: !!breederId,
    }),

  applicationForm: (breederId: string) =>
    createQuery({
      queryKey: [...breederQueries.all(), 'application-form', breederId],
      queryFn: () => getBreederApplicationForm(breederId),
      enabled: !!breederId,
    }),

  receivedApplications: (limit = 10) =>
    createInfiniteQuery<ReceivedApplicationItemDto>({
      queryKey: [...breederQueries.all(), 'received-applications', limit],
      queryFn: (page) => getReceivedApplications(page, limit),
    }),

  receivedApplicationDetail: (applicationId: string) =>
    createQuery({
      queryKey: [...breederQueries.all(), 'received-application', applicationId],
      queryFn: () => getReceivedApplicationDetail(applicationId),
      enabled: !!applicationId,
    }),

  chatMessages: (applicationId: string) =>
    createQuery({
      queryKey: [...breederQueries.all(), 'chat', applicationId],
      queryFn: () => getApplicationChatMessages(applicationId),
      enabled: !!applicationId,
      staleTime: STALE_TIME.REALTIME,
    }),
}

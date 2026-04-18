'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { breederQueries } from './Queries'
import type {
  SearchBreederParams,
} from '@/shared/types'

export const useBreederProfile = (breederId: string) => useQuery(breederQueries.profile(breederId))

export const useMyBreederProfile = () => useQuery(breederQueries.myProfile())

export const useBreederDashboard = () => useQuery(breederQueries.dashboard())

export const useExploreBreeders = (params: SearchBreederParams) =>
  useInfiniteQuery(breederQueries.explore(params))

export const usePopularBreeders = () => useQuery(breederQueries.popular())

export const useBreederPets = (breederId: string, limit?: number) =>
  useInfiniteQuery(breederQueries.pets(breederId, limit))

export const useParentPets = (breederId: string, limit?: number) =>
  useInfiniteQuery(breederQueries.parentPets(breederId, limit))

export const useBreederReviews = (breederId: string, limit?: number) =>
  useInfiniteQuery(breederQueries.reviews(breederId, limit))

export const useBreederApplicationForm = (breederId: string) =>
  useQuery(breederQueries.applicationForm(breederId))

export const useReceivedApplications = (limit?: number) =>
  useInfiniteQuery(breederQueries.receivedApplications(limit))

export const useReceivedApplicationDetail = (applicationId: string) =>
  useQuery(breederQueries.receivedApplicationDetail(applicationId))

export const useApplicationChatMessages = (applicationId: string) =>
  useQuery(breederQueries.chatMessages(applicationId))

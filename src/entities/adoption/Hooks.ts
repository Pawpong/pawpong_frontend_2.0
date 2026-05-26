'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { CommunityPetType, PetStatus, AdoptionSortType } from '@/shared/types'
import { adoptionQueries } from './Queries'

export const useAdoptionList = (
  sort?: AdoptionSortType,
  petType?: CommunityPetType,
  status?: PetStatus,
  keyword?: string,
  pageSize?: number,
) => useInfiniteQuery(adoptionQueries.list(sort, petType, status, keyword, pageSize))

export const useBreederAdoptionPets = (
  breederId: string,
  excludePetId?: string,
  pageSize?: number,
) => useInfiniteQuery(adoptionQueries.breederPets(breederId, excludePetId, pageSize))

export const usePopularAdoptions = (petType?: CommunityPetType, limit?: number) =>
  useQuery(adoptionQueries.popular(petType, limit))

export const useAdoptionDetail = (petId: string) =>
  useQuery(adoptionQueries.detail(petId))

export const useMyFavoriteAdoptions = (status?: PetStatus, pageSize?: number) =>
  useInfiniteQuery(adoptionQueries.myFavorites(status, pageSize))

export const useMyAdoptedPets = (pageSize?: number) =>
  useInfiniteQuery(adoptionQueries.myAdopted(pageSize))

import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { CommunityPetType, PetStatus, AdoptionSortType } from '@/shared/types'
import {
  getAdoptionList,
  getPopularAdoptions,
  getAdoptionDetail,
  getMyFavoriteAdoptions,
  getMyAdoptedPets,
} from './adoption.api'

export const adoptionQueries = {
  all: () => ['adoption'] as const,

  list: (
    sort: AdoptionSortType = 'latest',
    petType?: CommunityPetType,
    status?: PetStatus,
    keyword?: string,
    pageSize = 15,
  ) =>
    createInfiniteQuery({
      queryKey: [...adoptionQueries.all(), 'list', sort, petType, status, keyword, pageSize],
      queryFn: (page) => getAdoptionList({ sort, petType, status, keyword, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  breederPets: (breederId: string, excludePetId?: string, pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...adoptionQueries.all(), 'breederPets', breederId, excludePetId, pageSize],
      queryFn: (page) => getAdoptionList({ breederId, excludePetId, page, pageSize }),
      enabled: !!breederId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  popular: (petType?: CommunityPetType, limit = 3) =>
    createQuery({
      queryKey: [...adoptionQueries.all(), 'popular', petType, limit],
      queryFn: () => getPopularAdoptions({ petType, limit }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  detail: (petId: string) =>
    createQuery({
      queryKey: [...adoptionQueries.all(), 'detail', petId],
      queryFn: () => getAdoptionDetail(petId),
      enabled: !!petId,
      staleTime: STALE_TIME.DEFAULT,
    }),

  myFavoritesAll: () => [...adoptionQueries.all(), 'myFavorites'] as const,

  myFavorites: (status?: PetStatus, pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...adoptionQueries.myFavoritesAll(), status, pageSize],
      queryFn: (page) => getMyFavoriteAdoptions({ status, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  favoritesPage: (status: PetStatus | undefined, page: number, pageSize = 15) =>
    createQuery({
      queryKey: [...adoptionQueries.all(), 'favoritesPage', status, page, pageSize],
      queryFn: () => getMyFavoriteAdoptions({ status, page, pageSize }),
      staleTime: STALE_TIME.REALTIME,
    }),

  myAdopted: (pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...adoptionQueries.all(), 'myAdopted', pageSize],
      queryFn: (page) => getMyAdoptedPets({ page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),
}

import { createQuery, STALE_TIME } from '@/shared/api'
import type { BreedPetType } from '@/shared/types'
import { getBreeds } from './breed.api'

export const breedQueries = {
  all: () => ['breed'] as const,

  list: (petType: BreedPetType) =>
    createQuery({
      queryKey: [...breedQueries.all(), 'list', petType],
      queryFn: () => getBreeds(petType),
      enabled: !!petType,
      staleTime: STALE_TIME.STATIC,
    }),
}

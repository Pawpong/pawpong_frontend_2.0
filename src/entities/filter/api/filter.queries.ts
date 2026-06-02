import { createQuery, STALE_TIME } from '@/shared/api'
import {
  getAllFilterOptions,
  getBreederLevels,
  getSortOptions,
  getDogSizes,
  getCatFurLengths,
  getAdoptionStatus,
} from './filter.api'

export const filterQueries = {
  all: () => ['filter'] as const,

  options: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'options'],
      queryFn: getAllFilterOptions,
      staleTime: STALE_TIME.STATIC,
    }),

  breederLevels: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'breederLevels'],
      queryFn: getBreederLevels,
      staleTime: STALE_TIME.STATIC,
    }),

  sortOptions: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'sortOptions'],
      queryFn: getSortOptions,
      staleTime: STALE_TIME.STATIC,
    }),

  dogSizes: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'dogSizes'],
      queryFn: getDogSizes,
      staleTime: STALE_TIME.STATIC,
    }),

  catFurLengths: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'catFurLengths'],
      queryFn: getCatFurLengths,
      staleTime: STALE_TIME.STATIC,
    }),

  adoptionStatus: () =>
    createQuery({
      queryKey: [...filterQueries.all(), 'adoptionStatus'],
      queryFn: getAdoptionStatus,
      staleTime: STALE_TIME.STATIC,
    }),
}

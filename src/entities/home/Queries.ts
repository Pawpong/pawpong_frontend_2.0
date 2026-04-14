import { createQuery, STALE_TIME } from '@/shared/api'
import { getBanners, getAdopterFaqs, getBreederFaqs, getAvailablePets } from './Api'

export const homeQueries = {
  all: () => ['home'] as const,

  banners: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'banners'],
      queryFn: getBanners,
      staleTime: STALE_TIME.LONG,
    }),

  adopterFaqs: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'faqs', 'adopter'],
      queryFn: getAdopterFaqs,
      staleTime: STALE_TIME.VERY_LONG,
    }),

  breederFaqs: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'faqs', 'breeder'],
      queryFn: getBreederFaqs,
      staleTime: STALE_TIME.VERY_LONG,
    }),

  availablePets: (limit = 10) =>
    createQuery({
      queryKey: [...homeQueries.all(), 'available-pets', limit],
      queryFn: () => getAvailablePets(limit),
    }),
}

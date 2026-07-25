import { createQuery, STALE_TIME } from '@/shared/api'
import { getBanners, getAdopterFaqs, getBreederFaqs, getAvailablePets } from './home.api'

// 홈 섹션은 모두 비필수(부분 실패) — 하나가 죽어도 페이지는 렌더되어야 하므로 바운더리로 던지지 않음
export const homeQueries = {
  all: () => ['home'] as const,

  banners: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'banners'],
      queryFn: getBanners,
      staleTime: STALE_TIME.LONG,
      throwOnError: false,
    }),

  adopterFaqs: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'faqs', 'adopter'],
      queryFn: getAdopterFaqs,
      staleTime: STALE_TIME.VERY_LONG,
      throwOnError: false,
    }),

  breederFaqs: () =>
    createQuery({
      queryKey: [...homeQueries.all(), 'faqs', 'breeder'],
      queryFn: getBreederFaqs,
      staleTime: STALE_TIME.VERY_LONG,
      throwOnError: false,
    }),

  availablePets: (limit = 10) =>
    createQuery({
      queryKey: [...homeQueries.all(), 'available-pets', limit],
      queryFn: () => getAvailablePets(limit),
      throwOnError: false,
    }),
}

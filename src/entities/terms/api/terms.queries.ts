import { createQuery, STALE_TIME } from '@/shared/api'
import type { TermsCode } from '@/shared/types'
import { getActiveTermsList, getTermsByCode } from './terms.api'

export const termsQueries = {
  all: () => ['terms'] as const,

  list: () =>
    createQuery({
      queryKey: [...termsQueries.all(), 'list'],
      queryFn: () => getActiveTermsList(),
      staleTime: STALE_TIME.VERY_LONG,
    }),

  detail: (code: TermsCode) =>
    createQuery({
      queryKey: [...termsQueries.all(), 'detail', code],
      queryFn: () => getTermsByCode(code),
      enabled: !!code,
      staleTime: STALE_TIME.VERY_LONG,
    }),
}

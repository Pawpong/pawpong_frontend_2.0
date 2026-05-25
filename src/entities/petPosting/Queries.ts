import { createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { PetStatus } from '@/shared/types'
import { getMyPetPostings } from './Api'

export const petPostingQueries = {
  all: () => ['petPosting'] as const,

  myList: (status?: PetStatus, pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...petPostingQueries.all(), 'myList', status, pageSize],
      queryFn: (page) => getMyPetPostings({ status, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),
}

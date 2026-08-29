import { createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { PetStatus } from '@/shared/types'
import { getMyPetPostings, getMyPetPostingDrafts, getPetPostingDraft } from './pet-posting.api'

export const petPostingQueries = {
  all: () => ['petPosting'] as const,

  myList: (status?: PetStatus, pageSize = 15) =>
    createInfiniteQuery({
      queryKey: [...petPostingQueries.all(), 'myList', status, pageSize],
      queryFn: (page) => getMyPetPostings({ status, page, pageSize }),
      staleTime: STALE_TIME.DEFAULT,
    }),

  // 임시저장은 목록이 짧고 페이지네이션이 없어 일반 쿼리로 둔다
  drafts: () => ({
    queryKey: [...petPostingQueries.all(), 'drafts'] as const,
    queryFn: () => getMyPetPostingDrafts(),
    staleTime: STALE_TIME.DEFAULT,
  }),

  draft: (draftId: string) => ({
    queryKey: [...petPostingQueries.all(), 'drafts', draftId] as const,
    queryFn: () => getPetPostingDraft(draftId),
    staleTime: STALE_TIME.DEFAULT,
  }),
}

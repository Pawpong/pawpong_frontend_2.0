import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { Notice } from '@/shared/types'
import { getNoticeList, getNoticeDetail } from './api'

export const noticeQueries = {
  all: () => ['notice'] as const,

  list: (limit = 10) =>
    createInfiniteQuery<Notice>({
      queryKey: [...noticeQueries.all(), 'list', limit],
      queryFn: (page) => getNoticeList(page, limit),
      staleTime: STALE_TIME.LONG,
    }),

  detail: (noticeId: string) =>
    createQuery({
      queryKey: [...noticeQueries.all(), 'detail', noticeId],
      queryFn: () => getNoticeDetail(noticeId),
      enabled: !!noticeId,
      staleTime: STALE_TIME.LONG,
    }),
}

import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { Announcement } from '@/shared/types'
import { getActiveAnnouncements, getAnnouncementById } from './announcement.api'

export const announcementQueries = {
  all: () => ['announcement'] as const,

  list: (limit = 10) =>
    createInfiniteQuery<Announcement>({
      queryKey: [...announcementQueries.all(), 'list', limit],
      queryFn: (page) => getActiveAnnouncements(page, limit),
      staleTime: STALE_TIME.LONG,
    }),

  detail: (announcementId: string) =>
    createQuery({
      queryKey: [...announcementQueries.all(), 'detail', announcementId],
      queryFn: () => getAnnouncementById(announcementId),
      enabled: !!announcementId,
      staleTime: STALE_TIME.LONG,
    }),
}

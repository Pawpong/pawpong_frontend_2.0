import { queryOptions } from '@tanstack/react-query'
import { STALE_TIME } from '@/shared/api'
import { getChatRooms, getChatMessages } from './chat.api'

export const chatQueries = {
  all: () => ['chat'] as const,

  rooms: () =>
    queryOptions({
      queryKey: [...chatQueries.all(), 'rooms'],
      queryFn: ({ signal }) => getChatRooms(signal),
      staleTime: STALE_TIME.REALTIME,
    }),

  messages: (roomId: string, limit = 50) =>
    queryOptions({
      queryKey: [...chatQueries.all(), 'messages', roomId, limit],
      queryFn: ({ signal }) => getChatMessages(roomId, limit, undefined, signal),
      enabled: !!roomId,
      staleTime: STALE_TIME.REALTIME,
    }),
}

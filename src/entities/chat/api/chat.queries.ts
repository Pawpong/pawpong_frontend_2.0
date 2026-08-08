import { createQuery, STALE_TIME } from '@/shared/api'
import { getChatRooms, getChatMessages } from './chat.api'

export const chatQueries = {
  all: () => ['chat'] as const,

  rooms: () =>
    createQuery({
      queryKey: [...chatQueries.all(), 'rooms'],
      queryFn: getChatRooms,
      staleTime: STALE_TIME.REALTIME,
    }),

  messages: (roomId: string, limit = 50) =>
    createQuery({
      queryKey: [...chatQueries.all(), 'messages', roomId, limit],
      queryFn: () => getChatMessages(roomId, limit),
      enabled: !!roomId,
      staleTime: STALE_TIME.REALTIME,
    }),
}

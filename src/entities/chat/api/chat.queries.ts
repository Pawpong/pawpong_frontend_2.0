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

  // nav 채팅 뱃지용 안 읽은 메시지 합계 — 방 목록과 같은 캐시라 소켓·전송 후 invalidate 가 그대로 반영된다
  unreadCount: () =>
    queryOptions({
      ...chatQueries.rooms(),
      select: (rooms) => rooms.reduce((sum, room) => sum + room.unreadCount, 0),
    }),

  messages: (roomId: string, limit = 50) =>
    queryOptions({
      queryKey: [...chatQueries.all(), 'messages', roomId, limit],
      queryFn: ({ signal }) => getChatMessages(roomId, limit, undefined, signal),
      enabled: !!roomId,
      staleTime: STALE_TIME.REALTIME,
    }),
}

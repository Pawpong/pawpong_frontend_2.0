import { apiClient, API_VERSION } from '@/shared/api'
import type { ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<ChatRoomResponseDto[]>(`${API_VERSION}/chat/rooms`)
    .then((response) => response.data)

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<ChatMessageResponseDto[]>(`${API_VERSION}/chat/rooms/${roomId}/messages`, {
      params: { limit, before },
    })
    .then((response) => response.data)

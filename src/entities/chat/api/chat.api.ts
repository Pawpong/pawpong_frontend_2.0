import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<{
      success: boolean
      data: ChatRoomResponseDto[]
      message?: string
    }>(`${API_VERSION}/chat/rooms`)
    .then(unwrap)

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<{
      success: boolean
      data: ChatMessageResponseDto[]
      message?: string
    }>(`${API_VERSION}/chat/rooms/${roomId}/messages`, { params: { limit, before } })
    .then(unwrap)

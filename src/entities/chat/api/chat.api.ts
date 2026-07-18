import { apiClient, unwrap, API_VERSION } from '@/shared/api'
import type { ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

// 채팅 REST 도 다른 도메인과 동일하게 v2 경로를 쓴다 (백엔드 @Controller('v2/chat') + global prefix 'api').
const CHAT_BASE = `${API_VERSION}/chat`

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<{
      success: boolean
      data: ChatRoomResponseDto[]
      message?: string
    }>(`${CHAT_BASE}/rooms`)
    .then(unwrap)

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<{
      success: boolean
      data: ChatMessageResponseDto[]
      message?: string
    }>(`${CHAT_BASE}/rooms/${roomId}/messages`, { params: { limit, before } })
    .then(unwrap)

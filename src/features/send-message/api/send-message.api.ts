import { apiClient, unwrap, unwrapVoid } from '@/shared/api'
import type { ChatRoomResponseDto, CreateRoomRequestDto } from '@/shared/types'

// 채팅 REST 는 v2 가 아니라 /api/chat 경로다 (백엔드 @Controller('chat')). API_VERSION 붙이면 404.
// 메시지 전송/수신은 REST 가 아니라 WebSocket(/chat 네임스페이스, send_message/new_message)으로
// 처리한다. useChatRoomSocket 참고. (백엔드에 메시지 전송용 REST 엔드포인트는 존재하지 않음)
const CHAT_BASE = '/api/chat'

/** 채팅방 생성 또는 기존 방 조회 */
export const createOrGetChatRoom = (data: CreateRoomRequestDto) =>
  apiClient
    .post<{
      success: boolean
      data: ChatRoomResponseDto
      message?: string
    }>(`${CHAT_BASE}/rooms`, data)
    .then(unwrap)

/** 채팅방 종료 */
export const closeChatRoom = (roomId: string) =>
  apiClient
    .delete<{
      success: boolean
      data: object
      message?: string
    }>(`${CHAT_BASE}/rooms/${roomId}`)
    .then(unwrapVoid)

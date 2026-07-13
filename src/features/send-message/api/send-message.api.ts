import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type { ChatRoomResponseDto, CreateRoomRequestDto } from '@/shared/types'

// 메시지 전송/수신은 REST 가 아니라 WebSocket(/chat 네임스페이스, send_message/new_message)으로
// 처리한다. useChatRoomSocket 참고. (백엔드에 메시지 전송용 REST 엔드포인트는 존재하지 않음)

/** 채팅방 생성 또는 기존 방 조회 */
export const createOrGetChatRoom = (data: CreateRoomRequestDto) =>
  apiClient
    .post<{
      success: boolean
      data: ChatRoomResponseDto
      message?: string
    }>(`${API_VERSION}/chat/rooms`, data)
    .then(unwrap)

/** 채팅방 종료 */
export const closeChatRoom = (roomId: string) =>
  apiClient
    .delete<{
      success: boolean
      data: object
      message?: string
    }>(`${API_VERSION}/chat/rooms/${roomId}`)
    .then(unwrapVoid)

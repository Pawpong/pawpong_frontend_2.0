import { apiClient, unwrap, unwrapVoid, API_VERSION } from '@/shared/api'
import type { ApiResponseFull, ChatRoomResponseDto, CreateRoomRequestDto } from '@/shared/types'

// 채팅방 생성/종료 REST 도 다른 도메인과 동일하게 v2 경로를 쓴다 (백엔드 @Controller('v2/chat')).
// 메시지 전송/수신은 REST 가 아니라 WebSocket(/chat 네임스페이스, send_message/new_message)으로
// 처리한다. useChatRoomSocket 참고. (백엔드에 메시지 전송용 REST 엔드포인트는 존재하지 않음)
const CHAT_BASE = `${API_VERSION}/chat`

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
  apiClient.delete<ApiResponseFull<null>>(`${CHAT_BASE}/rooms/${roomId}`).then(unwrapVoid)

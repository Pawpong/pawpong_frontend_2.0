import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ChatRoomResponseDto,
  ChatMessageResponseDto,
  CreateRoomRequestDto,
  SendChatMessageRequest,
} from '@/shared/types'

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

/** 채팅 메시지 전송 */
export const sendChatMessage = (roomId: string, data: SendChatMessageRequest) =>
  apiClient
    .post<{
      success: boolean
      data: ChatMessageResponseDto
      message?: string
    }>(`${API_VERSION}/chat/rooms/${roomId}/messages`, data)
    .then(unwrap)

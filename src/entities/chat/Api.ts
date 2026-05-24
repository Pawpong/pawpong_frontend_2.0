import { apiClient, unwrap, unwrapVoid } from '@/shared/api'
import type {
  ChatRoomResponseDto,
  ChatMessageResponseDto,
  CreateRoomRequestDto,
  SendChatMessageRequest,
} from '@/shared/types'

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<{ success: boolean; data: ChatRoomResponseDto[]; message?: string }>('/api/chat/rooms')
    .then(unwrap)

/** 채팅방 생성 또는 기존 방 조회 */
export const createOrGetChatRoom = (data: CreateRoomRequestDto) =>
  apiClient
    .post<{
      success: boolean
      data: ChatRoomResponseDto
      message?: string
    }>('/api/chat/rooms', data)
    .then(unwrap)

/** 채팅방 종료 */
export const closeChatRoom = (roomId: string) =>
  apiClient
    .delete<{ success: boolean; data: object; message?: string }>(`/api/chat/rooms/${roomId}`)
    .then(unwrapVoid)

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<{
      success: boolean
      data: ChatMessageResponseDto[]
      message?: string
    }>(`/api/chat/rooms/${roomId}/messages`, { params: { limit, before } })
    .then(unwrap)

/** 채팅 메시지 전송 */
export const sendChatMessage = (roomId: string, data: SendChatMessageRequest) =>
  apiClient
    .post<{
      success: boolean
      data: ChatMessageResponseDto
      message?: string
    }>(`/api/chat/rooms/${roomId}/messages`, data)
    .then(unwrap)

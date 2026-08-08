import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<ApiResponseFull<ChatRoomResponseDto[]>>(`${API_VERSION}/chat/rooms`)
    .then((response) => unwrap(response, '채팅방 목록을 불러오지 못했습니다.'))

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<ApiResponseFull<ChatMessageResponseDto[]>>(
      `${API_VERSION}/chat/rooms/${roomId}/messages`,
      { params: { limit, before } },
    )
    .then((response) => unwrap(response, '메시지를 불러오지 못했습니다.'))

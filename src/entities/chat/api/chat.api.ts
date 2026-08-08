import type { AxiosResponse } from 'axios'
import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

type ChatListPayload<T> = ApiResponseFull<T[]> | T[]

/** 개발 서버의 raw 배열과 표준 ApiResponseDto 봉투를 모두 정규화한다. */
const unwrapChatListResponse = <T>(
  response: AxiosResponse<ChatListPayload<T>>,
  fallbackMessage: string,
): T[] => {
  if (Array.isArray(response.data)) return response.data

  return unwrap({ status: response.status, data: response.data }, fallbackMessage)
}

/** 서버 정렬을 신뢰하지 않고 시간 오름차순으로 맞춘다(동시각은 messageId로 안정 정렬). */
const sortMessages = (messages: ChatMessageResponseDto[]) =>
  messages.slice().sort((a, b) => {
    const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return timeDiff || a.messageId.localeCompare(b.messageId)
  })

/** 내 채팅방 목록 조회 */
export const getChatRooms = () =>
  apiClient
    .get<ChatListPayload<ChatRoomResponseDto>>(`${API_VERSION}/chat/rooms`)
    .then((response) => unwrapChatListResponse(response, '채팅방 목록을 불러오지 못했습니다.'))

/** 채팅 메시지 내역 조회 (커서 기반 페이지네이션) */
export const getChatMessages = (roomId: string, limit?: number, before?: string) =>
  apiClient
    .get<
      ChatListPayload<ChatMessageResponseDto>
    >(`${API_VERSION}/chat/rooms/${roomId}/messages`, { params: { limit, before } })
    .then((response) =>
      sortMessages(unwrapChatListResponse(response, '메시지를 불러오지 못했습니다.')),
    )

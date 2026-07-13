/**
 * 채팅 관련 타입 정의
 * 출처: 백엔드 chat-room-response.dto.ts / chat-message-response.dto.ts
 */

export type ChatRoomStatus = 'active' | 'closed'
export type ChatSenderRole = 'adopter' | 'breeder'
export type ChatMessageType = 'text' | 'image' | 'file'

/** 채팅방 상대방(카운터파트) 요약 */
export interface ChatRoomCounterpart {
  userId: string
  role: ChatSenderRole
  nickname: string
  profileImageUrl?: string
}

/** 채팅방 응답 DTO */
export interface ChatRoomResponseDto {
  roomId: string
  applicationId?: string
  status: ChatRoomStatus
  counterpart: ChatRoomCounterpart
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

/** 채팅 메시지 응답 DTO (isMine 은 서버가 요청자 기준으로 계산) */
export interface ChatMessageResponseDto {
  messageId: string
  roomId: string
  senderRole: ChatSenderRole
  isMine: boolean
  content: string
  messageType: ChatMessageType
  isRead: boolean
  createdAt: string
}

/**
 * WebSocket `new_message` 브로드캐스트 페이로드.
 * REST DTO 와 달리 isMine 이 없고 senderId 를 그대로 내려주므로
 * 클라이언트에서 현재 사용자 기준으로 isMine 을 계산해 정규화한다.
 */
export interface ChatNewMessagePayload {
  messageId: string
  roomId: string
  senderId: string
  senderRole: ChatSenderRole
  receiverId: string
  content: string
  messageType: ChatMessageType
  isRead: boolean
  createdAt: string
}

/** 채팅방 생성 요청 */
export interface CreateRoomRequestDto {
  breederId: string
  applicationId?: string
}

/** 채팅 메시지 DTO (브리더 관리용 - 레거시) */
export interface ChatMessageDto {
  messageId: string
  senderRole: 'breeder' | 'adopter' | 'system'
  content: string
  sentAt: string
}

/** 채팅 메시지 전송 요청 */
export interface SendChatMessageRequest {
  content: string
}

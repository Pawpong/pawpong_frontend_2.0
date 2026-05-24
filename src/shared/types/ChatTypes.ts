/**
 * 채팅 관련 타입 정의
 * 출처: swagger.json - ChatRoomResponseDto, ChatMessageResponseDto, CreateRoomRequestDto
 */

/** 채팅방 응답 DTO */
export interface ChatRoomResponseDto {
  roomId: string
  adopterId: string
  breederId: string
  applicationId?: string
  status: 'active' | 'closed'
  lastMessage?: string
  lastMessageAt?: string
  createdAt: string
}

/** 채팅 메시지 응답 DTO */
export interface ChatMessageResponseDto {
  messageId: string
  roomId: string
  senderId: string
  senderRole: 'adopter' | 'breeder'
  content: string
  messageType: 'text' | 'image' | 'file'
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

/**
 * 채팅 관련 타입 정의
 * 출처: swagger.json - ChatRoomResponseDto, ChatMessageResponseDto, CreateRoomRequestDto
 */

export type ChatParticipantRole = 'adopter' | 'breeder'
export type ChatMessageType = 'text' | 'image' | 'file' | 'location'

/** 채팅방 상대방 정보 */
export interface ChatRoomCounterpartResponseDto {
  userId: string
  role: ChatParticipantRole
  nickname: string
  profileImageUrl?: string
}

/** 채팅방 응답 DTO (GET /api/v2/chat/rooms) */
export interface ChatRoomResponseDto {
  roomId: string
  applicationId?: string
  status: 'active' | 'closed'
  counterpart: ChatRoomCounterpartResponseDto
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

/** REST 채팅 메시지 응답 DTO */
export interface ChatMessageResponseDto {
  messageId: string
  roomId: string
  senderRole: ChatParticipantRole
  isMine: boolean
  content: string
  messageType: ChatMessageType
  isRead: boolean
  createdAt: string
}

/** Socket.IO new_message 이벤트 페이로드 */
export interface WsChatMessage {
  messageId: string
  roomId: string
  senderId: string
  senderRole: ChatParticipantRole
  receiverId: string
  content: string
  messageType: ChatMessageType
  isRead: boolean
  createdAt: string | Date
}

/** Socket.IO messages_read 이벤트 페이로드 */
export interface WsMessagesRead {
  roomId: string
  readBy: string
}

/** 채팅방 생성 요청 (POST /v2/chat/rooms — 이미 방이 있으면 기존 방을 돌려준다) */
export interface CreateRoomRequestDto {
  /** 대화 상대 userId. 입양자·브리더 어느 쪽이든 상대를 지정할 수 있다 */
  counterpartUserId?: string
  /** @deprecated counterpartUserId 를 쓸 것. 브리더만 상대로 지정할 수 있던 시절의 필드 */
  breederId?: string
  /** 연결할 상담 신청 id — 채팅방 상단 펫 정보 카드가 이 값으로 채워진다 */
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

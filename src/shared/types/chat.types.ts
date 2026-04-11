/**
 * 채팅 관련 타입 정의
 * 출처: application/_types/chat.ts, breeder.ts (BreederChatMessageDto)
 *

 */

/** 채팅 메시지 DTO (백엔드 응답 기준) */
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

/**
 * 알림 관련 타입 정의
 * 출처: notification.ts
 */

import type { PaginationResponse } from './ApiTypes'

export type NotificationType =
  | 'BREEDER_APPROVED'
  | 'BREEDER_UNAPPROVED'
  | 'BREEDER_ONBOARDING_INCOMPLETE'
  | 'NEW_CONSULT_REQUEST'
  | 'NEW_REVIEW_REGISTERED'
  | 'CONSULT_COMPLETED'
  | 'ADOPTION_APPROVED'
  | 'ADOPTION_REJECTED'
  | 'NEW_PET_REGISTERED'
  | 'DOCUMENT_REMINDER'
  | 'COMMUNITY_POST_LIKED'
  | 'COMMUNITY_POST_COMMENTED'
  | 'COMMUNITY_COMMENT_REPLIED'
  | 'CHAT_MESSAGE_RECEIVED'

/** 백엔드 알림 분류(GET/DELETE /notification ?category=). 화면 필터와 일괄 삭제 단위. */
export type NotificationCategory = 'chat' | 'community' | 'adoption' | 'account' | 'notice'

export interface NotificationListFilter {
  isRead?: boolean
  category?: NotificationCategory
}

export interface NotificationBulkDeleteFilter {
  category?: NotificationCategory
  /** true면 읽은 알림만 지운다 */
  onlyRead?: boolean
}

export interface NotificationResponseDto {
  notificationId: string
  userId: string
  userRole: 'adopter' | 'breeder'
  type: NotificationType
  title: string
  body: string
  metadata?: Record<string, unknown>
  targetUrl?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface UnreadCountResponseDto {
  unreadCount: number
}

export interface MarkAsReadResponseDto {
  notificationId: string
  isRead: boolean
  readAt: string
}

export interface MarkAllAsReadResponseDto {
  updatedCount: number
}

export type NotificationListResponse = PaginationResponse<NotificationResponseDto>

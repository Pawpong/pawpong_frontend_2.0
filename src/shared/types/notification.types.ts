/**
 * 알림 관련 타입 정의
 * 출처: notification.ts
 */

import type { PaginationResponse } from './api.types'

export type NotificationType =
  | 'BREEDER_APPROVED'
  | 'BREEDER_UNAPPROVED'
  | 'BREEDER_ONBOARDING_INCOMPLETE'
  | 'NEW_CONSULT_REQUEST'
  | 'NEW_REVIEW_REGISTERED'
  | 'CONSULT_COMPLETED'
  | 'NEW_PET_REGISTERED'
  | 'DOCUMENT_REMINDER'

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

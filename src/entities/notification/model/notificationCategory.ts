import type { NotificationCategory, NotificationType } from '@/shared/types'

/** 알림 화면 필터 순서와 이름. 백엔드 constants/notification-category.ts 분류와 같다. */
export const NOTIFICATION_CATEGORY_OPTIONS: ReadonlyArray<{
  value: NotificationCategory
  label: string
}> = [
  { value: 'chat', label: '채팅' },
  { value: 'community', label: '커뮤니티' },
  { value: 'adoption', label: '입양·상담' },
  { value: 'account', label: '계정' },
  { value: 'notice', label: '공지' },
]

export const notificationCategoryLabel = (category: NotificationCategory) =>
  NOTIFICATION_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? '알림'

const TYPE_CATEGORY: Partial<Record<NotificationType, NotificationCategory>> = {
  CHAT_MESSAGE_RECEIVED: 'chat',
  COMMUNITY_POST_LIKED: 'community',
  COMMUNITY_POST_COMMENTED: 'community',
  COMMUNITY_COMMENT_REPLIED: 'community',
  NEW_CONSULT_REQUEST: 'adoption',
  CONSULT_COMPLETED: 'adoption',
  ADOPTION_APPROVED: 'adoption',
  ADOPTION_REJECTED: 'adoption',
  NEW_REVIEW_REGISTERED: 'adoption',
  NEW_PET_REGISTERED: 'adoption',
  BREEDER_APPROVED: 'account',
  BREEDER_UNAPPROVED: 'account',
  BREEDER_ONBOARDING_INCOMPLETE: 'account',
  DOCUMENT_REMINDER: 'account',
}

/** 응답 type 대소문자와 프론트에 아직 없는 타입을 모두 받아 분류 배지에 쓴다. */
export const notificationCategoryOf = (type: string): NotificationCategory | null => {
  const upper = type.toUpperCase() as NotificationType
  if (TYPE_CATEGORY[upper]) return TYPE_CATEGORY[upper] ?? null
  if (upper === ('ADMIN_BROADCAST' as NotificationType)) return 'notice'
  return null
}

export type CommunityReviewReason =
  | 'relevant'
  | 'off_topic'
  | 'unsafe'
  | 'privacy'
  | 'unclear'
  | 'not_consented'
  | 'limit_reached'
  | 'photo_unavailable'
  | 'service_unavailable'
  | 'source_changed'

/** 서버가 작성자에게만 제공하는 표시용 상태. 내부 승인 원장은 받지 않음. */
export interface CommunityPostReview {
  state: 'approved' | 'held'
  reason: CommunityReviewReason
  message: string
  reviewedAt?: string
  checkedPhotoCount: number
  canRequestReview: boolean
}

export interface CommunityReviewConfig {
  enabled: boolean
  dailyLimit: number
  notice: string
}

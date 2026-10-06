import type {
  CommunityPostReview,
  CommunityReviewConfig,
  CommunityReviewReason,
} from '@/shared/types'

export const CLOSED_COMMUNITY_REVIEW_CONFIG: CommunityReviewConfig = {
  enabled: false,
  dailyLimit: 0,
  notice: '',
}
const REASONS = new Set<CommunityReviewReason>([
  'relevant',
  'off_topic',
  'unsafe',
  'privacy',
  'unclear',
  'not_consented',
  'limit_reached',
  'photo_unavailable',
  'service_unavailable',
  'source_changed',
])
export function parseCommunityReviewConfig(value: unknown): CommunityReviewConfig {
  if (!value || typeof value !== 'object') throw new Error('심사 설정을 확인하지 못했어요.')
  const config = value as Record<string, unknown>
  if (config.enabled === false) return CLOSED_COMMUNITY_REVIEW_CONFIG
  if (
    config.enabled !== true ||
    !Number.isSafeInteger(config.dailyLimit) ||
    (config.dailyLimit as number) < 1 ||
    (config.dailyLimit as number) > 100 ||
    typeof config.notice !== 'string' ||
    !config.notice.trim() ||
    config.notice.length > 1000
  )
    throw new Error('심사 설정을 확인하지 못했어요.')
  return { enabled: true, dailyLimit: config.dailyLimit as number, notice: config.notice }
}
export function parseCommunityPostReview(value: unknown): CommunityPostReview | undefined {
  if (value === undefined) return undefined
  const held: CommunityPostReview = {
    state: 'held',
    reason: 'service_unavailable',
    checkedPhotoCount: 0,
    canRequestReview: true,
    message: '심사 상태를 확인하지 못했어요. 최신 상태를 다시 확인해 주세요.',
  }
  if (!value || typeof value !== 'object') return held
  const review = value as Record<string, unknown>
  if (
    (review.state !== 'approved' && review.state !== 'held') ||
    !REASONS.has(review.reason as CommunityReviewReason) ||
    (review.state === 'approved' && review.reason !== 'relevant') ||
    review.canRequestReview !== (review.state === 'held') ||
    typeof review.message !== 'string' ||
    !review.message.trim() ||
    review.message.length > 1000 ||
    !Number.isSafeInteger(review.checkedPhotoCount) ||
    (review.checkedPhotoCount as number) < 0 ||
    (review.checkedPhotoCount as number) > 10
  )
    return held
  return {
    state: review.state as CommunityPostReview['state'],
    reason: review.reason as CommunityReviewReason,
    message: review.message,
    checkedPhotoCount: review.checkedPhotoCount as number,
    canRequestReview: review.state !== 'approved',
    ...(typeof review.reviewedAt === 'string' && Number.isFinite(Date.parse(review.reviewedAt))
      ? { reviewedAt: review.reviewedAt }
      : {}),
  }
}
export const isCommunityPostHeld = (post: { aiReview?: CommunityPostReview }) =>
  post.aiReview !== undefined && post.aiReview?.state !== 'approved'

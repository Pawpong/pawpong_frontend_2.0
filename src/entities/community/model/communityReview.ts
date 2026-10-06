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

/** 보류 사유별로 작성자가 다음에 할 수 있는 일. 서버 안내 문구 아래에 덧붙인다. */
export const COMMUNITY_REVIEW_NEXT_STEP: Record<CommunityReviewReason, string> = {
  relevant: '선택한 공개 범위로 보여지고 있어요.',
  off_topic: '반려동물 이야기가 잘 드러나도록 글을 고친 뒤 다시 심사해 주세요.',
  unsafe: '다른 보호자가 불편할 수 있는 표현이나 사진을 고친 뒤 다시 심사해 주세요.',
  privacy: '이름·전화번호·주소·진료기록이 보이는 부분을 가린 뒤 다시 심사해 주세요.',
  unclear: '어떤 이야기인지 한두 문장 더 적으면 확인하기 쉬워요.',
  not_consented: 'AI 처리에 동의하면 심사를 거쳐 공개할 수 있어요. 동의하지 않아도 글은 보관돼요.',
  limit_reached: '오늘 심사 횟수를 모두 썼어요. 글은 보관되며 내일 다시 요청할 수 있어요.',
  photo_unavailable: '사진을 확인하지 못했어요. 글 수정에서 사진을 다시 올려 주세요.',
  service_unavailable: 'AI 연결이 잠시 불안정해요. 글은 보관되니 잠시 뒤 다시 심사해 주세요.',
  source_changed: '심사한 뒤 글이 바뀌었어요. 지금 내용으로 다시 심사해 주세요.',
}

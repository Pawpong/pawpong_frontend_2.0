import type { CommunityPostReview } from './CommunityReviewTypes'

/** 작성자가 공개한 두 사진의 비포·애프터 비교 인덱스 */
export interface CommunityAiComparison {
  beforePhotoIndex: number
  afterPhotoIndex: number
}

/** 동물 종류 */
export type CommunityPetType = 'dog' | 'cat' | 'reptile'

/** 작성자 모델 */
export type CommunityAuthorModel = 'Adopter' | 'Breeder'

/** 정렬 기준 */
export type CommunitySortType = 'latest' | 'popular'

/** 공개 범위 — 전체공개 / 팔로워공개 / 나만보기 */
export type CommunityPostVisibility = 'public' | 'followers' | 'private'

/** 발행 상태 — 발행 / 임시저장 */
export type CommunityPostStatus = 'draft' | 'published'

/** 커뮤니티 게시글 카드 (목록용) */
export interface CommunityPostCard {
  aiReview?: CommunityPostReview
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  postId: string
  authorId: string
  authorModel: CommunityAuthorModel
  authorNickname: string
  authorProfileImageUrl?: string
  title?: string
  bodyExcerpt: string
  primaryPhotoUrl?: string
  photoUrls: string[]
  petType?: CommunityPetType
  category?: string
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  likeCount: number
  commentCount: number
  saveCount: number
  isLiked: boolean
  isSaved: boolean
  /** 현재 요청 사용자가 작성자를 팔로우 중인지 (비인증·본인 글이면 false) */
  isFollowingAuthor?: boolean
  createdAt: string
  /** 카드에 노출할 최신 댓글 (없으면 빈 배열) */
  commentPreview?: CommunityComment[]
}

/** 커뮤니티 댓글 */
export interface CommunityComment {
  commentId: string
  postId: string
  authorId: string
  authorModel: CommunityAuthorModel
  authorNickname: string
  authorProfileImageUrl?: string
  parentCommentId: string | null
  body: string
  likeCount: number
  createdAt: string
}

/** 커뮤니티 게시글 상세 */
export interface CommunityPostDetail {
  aiReview?: CommunityPostReview
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  postId: string
  authorId: string
  authorModel: CommunityAuthorModel
  authorNickname: string
  authorProfileImageUrl?: string
  title?: string
  body: string
  photoUrls: string[]
  petType?: CommunityPetType
  category?: string
  visibility: CommunityPostVisibility
  status: CommunityPostStatus
  likeCount: number
  commentCount: number
  saveCount: number
  viewCount: number
  createdAt: string
  commentPreview: CommunityComment[]
  /** 현재 요청 사용자의 좋아요 여부 (비인증 시 false) */
  isLiked: boolean
  /** 현재 요청 사용자의 저장 여부 (비인증 시 false) */
  isSaved: boolean
}

/** 게시글 목록 조회 파라미터 */
export interface CommunityPostListParams extends CommunityDiscoveryFilters {
  topic?: string
  petType?: CommunityPetType
  category?: string
  authorId?: string
  /** 제목·본문 키워드 검색 (대소문자 무시). 다른 필터와 AND 결합된다 */
  search?: string
  sort?: CommunitySortType
  page?: number
  pageSize?: number
}

/** 게시글 작성 요청 */
export interface CreateCommunityPostRequest {
  aiReviewConsent?: boolean
  /** 같은 내용의 저장 재시도를 한 글로 묶는 UUID v4. 심사가 켜진 새 글 발행에만 보낸다 */
  clientRequestId?: string
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  /** 발행(published) 시 필수, 임시저장(draft) 시 비어 있어도 됨 */
  body?: string
  title?: string
  photos?: string[]
  petType?: CommunityPetType
  category?: string
  /** 공개 범위 (기본 public) */
  visibility?: CommunityPostVisibility
  /** 발행 상태 (기본 published). 임시저장은 'draft' */
  status?: CommunityPostStatus
}

/** 게시글 수정 요청 */
export interface UpdateCommunityPostRequest {
  aiReviewConsent?: boolean
  experience?: CommunityExperience | null
  aiComparison?: CommunityAiComparison | null
  title?: string
  body?: string
  photos?: string[]
  petType?: CommunityPetType | null
  category?: string
  visibility?: CommunityPostVisibility
  status?: CommunityPostStatus
}

/** 게시글 삭제 응답 */
export interface CommunityPostDeleteResponse {
  deleted: boolean
}

/** 게시글 북마크 응답 */
export interface CommunityBookmarkResponse {
  postId: string
  saved: boolean
}

/** 게시글 북마크 취소 응답 */
export interface CommunityUnsaveResponse {
  postId: string
  unsaved: boolean
}

/** 커뮤니티 게시글 신고 사유 — 백엔드 CommunityReportReason과 동일 */
export type CommunityReportReason =
  | 'spam'
  | 'inappropriate_content'
  | 'false_info'
  | 'hateful_content'
  | 'other'

/** 게시글 신고 요청 */
export interface CommunityPostReportRequest {
  reason: CommunityReportReason
  description?: string
}

/** 게시글 신고 응답 — 중복 신고는 reported=false로 멱등 처리된다 */
export interface CommunityPostReportResponse {
  postId: string
  reported: boolean
}

/** 내 북마크 목록 조회 파라미터 */
export interface CommunityBookmarkListParams {
  page?: number
  pageSize?: number
}

/** 댓글 수정 요청 */
export interface UpdateCommunityCommentRequest {
  body: string
}

/** 댓글 작성 요청 */
export interface CreateCommunityCommentRequest {
  body: string
  /** 답글 대상 댓글 ID (없으면 최상위 댓글) */
  parentCommentId?: string
}

/** 명예의 전당 수상작 (회차 확정 시점의 스냅샷) */
export interface CommunityHallOfFameWinner {
  /** 1~3 */
  rank: number
  postId: string
  likeCount: number
  commentCount: number
  saveCount: number
  /** 사진 없는 글이면 null */
  photoUrl: string | null
  /** 본문 발췌 (최대 120자) */
  bodyExcerpt: string
  author: {
    userId: string
    authorModel: CommunityAuthorModel
    nickname: string
    profileImageUrl: string | null
  }
}

/** 명예의 전당 회차 — 한 달을 1~10일 / 11~20일 / 21~말일(KST) 3회차로 나눈다 */
export interface CommunityHallOfFame {
  /** 'YYYY-M-N' (N = 1|2|3) */
  periodKey: string
  startDate: string
  /** 다음 회차 시작 시각 (배타적) */
  endDate: string
  state: 'open' | 'final'
  refreshedAt: string
  /** 0~3건. 회차에 글이 없으면 빈 배열 (서버가 폴백하지 않는다) */
  winners: CommunityHallOfFameWinner[]
}
export interface CommunityRoutePoint {
  name: string
  latitude: number
  longitude: number
}
/** 산책 기록 — 날짜만 필수이고 나머지는 작성자가 직접 적은 값만 담는다 */
export interface CommunityWalkRecord {
  /** YYYY-MM-DD */
  walkedOn: string
  durationMinutes?: number
  distanceMeters?: number
  difficulty?: 'easy' | 'moderate' | 'hard'
  leashRequired?: boolean
  amenities?: Array<'water' | 'shade' | 'waste-bin' | 'parking'>
}

export type CommunityClinicVisitReason =
  | 'checkup'
  | 'vaccination'
  | 'dental'
  | 'skin'
  | 'emergency'
  | 'surgery'
  | 'rehabilitation'
  | 'other'

/** 병원 방문 경험 — 진단·처방이 아닌 작성자의 방문 기록 */
export interface CommunityClinicRecord {
  visitedOn: string
  clinicName: string
  visitReason: CommunityClinicVisitReason
  waitMinutes?: number
  costKrw?: number
  followUpOn?: string
}

export type CommunityLifeActivity =
  | 'meal'
  | 'grooming'
  | 'training'
  | 'play'
  | 'rest'
  | 'habitat'
  | 'other'

/** 반려생활 기록 */
export interface CommunityLifeRecord {
  recordedOn: string
  activity: CommunityLifeActivity
  petName?: string
  condition?: 'great' | 'usual' | 'watching'
}

export type CommunityRecordKind = 'walk' | 'clinic' | 'life'

export interface CommunityExperience {
  walk?: CommunityWalkRecord
  clinic?: CommunityClinicRecord
  life?: CommunityLifeRecord
  /** 작성자가 고른 태그와 저장 시 서버가 자동으로 붙인 태그가 함께 내려온다 */
  tags?: string[]
  topics: string[]
  question: boolean
  route: CommunityRoutePoint[]
  publicPlaceConfirmed: boolean
}

export interface CommunityDiscoveryFilters {
  topics?: string[]
  topicMatch?: 'any' | 'all'
  tags?: string[]
  kind?: 'question' | 'story'
  media?: 'photos' | 'map'
  period?: 'week' | 'month'
  record?: CommunityRecordKind
}

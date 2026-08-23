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
export interface CommunityPostListParams {
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
  title?: string
  body?: string
  photos?: string[]
  petType?: CommunityPetType
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

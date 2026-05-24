/** 동물 종류 */
export type CommunityPetType = 'dog' | 'cat' | 'reptile'

/** 작성자 모델 */
export type CommunityAuthorModel = 'Adopter' | 'Breeder'

/** 정렬 기준 */
export type CommunitySortType = 'latest' | 'popular'

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
  likeCount: number
  commentCount: number
  saveCount: number
  createdAt: string
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
  likeCount: number
  commentCount: number
  saveCount: number
  viewCount: number
  createdAt: string
  commentPreview: CommunityComment[]
}

/** 게시글 목록 조회 파라미터 */
export interface CommunityPostListParams {
  petType?: CommunityPetType
  category?: string
  authorId?: string
  sort?: CommunitySortType
  page?: number
  pageSize?: number
}

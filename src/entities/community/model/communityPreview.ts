import type { CommunityPostCard } from '@/shared/types'

interface CommunityPreviewAuthor {
  id: string
  nickname: string
  profileImageUrl?: string
}

interface CommunityPreviewProps {
  aiReview?: CommunityPostCard['aiReview']
  postId: string
  author: CommunityPreviewAuthor
  createdAt: string
  text: string
  images?: string[]
  aiComparison?: CommunityPostCard['aiComparison']
  likeCount: number
  commentCount: number
  isLiked: boolean
  isSaved: boolean
  shareable?: boolean
  detailHref?: string
  commentPreview?: { nickname: string; body: string }
}

const toCommunityPreviewProps = (post: CommunityPostCard): CommunityPreviewProps => ({
  aiReview: post.aiReview,
  postId: post.postId,
  shareable:
    post.visibility === 'public' && post.status === 'published' && post.aiReview?.state !== 'held',
  author: {
    id: post.authorId,
    nickname: post.authorNickname,
    profileImageUrl: post.authorProfileImageUrl,
  },
  createdAt: post.createdAt,
  text: post.bodyExcerpt,
  images: post.photoUrls,
  aiComparison: post.aiComparison,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
  isLiked: post.isLiked,
  isSaved: post.isSaved,
  detailHref: `/community/post/${post.postId}`,
  commentPreview: post.commentPreview?.[0] && {
    nickname: post.commentPreview[0].authorNickname,
    body: post.commentPreview[0].body,
  },
})

/** 텍스트 전용 글을 건너뛰고 실제 첫 LCP 후보가 되는 사진 글을 찾는다. */
const getFirstPhotoPostId = (posts: CommunityPostCard[]): string | undefined =>
  posts.find((post) => post.photoUrls.length > 0)?.postId

export { getFirstPhotoPostId, toCommunityPreviewProps }
export type { CommunityPreviewAuthor, CommunityPreviewProps }

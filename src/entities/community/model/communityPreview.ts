import type { CommunityPostCard } from '@/shared/types'

interface CommunityPreviewAuthor {
  id: string
  nickname: string
  profileImageUrl?: string
}

interface CommunityPreviewProps {
  postId: string
  author: CommunityPreviewAuthor
  createdAt: string
  text: string
  images?: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  isSaved: boolean
  detailHref?: string
  commentPreview?: { nickname: string; body: string }
}

const toCommunityPreviewProps = (post: CommunityPostCard): CommunityPreviewProps => ({
  postId: post.postId,
  author: {
    id: post.authorId,
    nickname: post.authorNickname,
    profileImageUrl: post.authorProfileImageUrl,
  },
  createdAt: post.createdAt,
  text: post.bodyExcerpt,
  images: post.photoUrls,
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

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
  detailHref: `/community/${post.postId}`,
})

export { toCommunityPreviewProps }
export type { CommunityPreviewAuthor, CommunityPreviewProps }

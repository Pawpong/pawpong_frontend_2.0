import type { CommunityPostCard } from '@/shared/types'

interface CommunityPreviewAuthor {
  id: string
  nickname: string
  profileImageUrl?: string
}

interface CommunityPreviewProps {
  author: CommunityPreviewAuthor
  createdAt: string
  text: string
  images?: string[]
  likeCount: number
  commentCount: number
  detailHref?: string
}

const toCommunityPreviewProps = (post: CommunityPostCard): CommunityPreviewProps => ({
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
  detailHref: `/community/${post.postId}`,
})

export { toCommunityPreviewProps }
export type { CommunityPreviewAuthor, CommunityPreviewProps }

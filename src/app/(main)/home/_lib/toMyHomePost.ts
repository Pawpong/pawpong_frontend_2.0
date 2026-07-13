import type { CommunityPostCard } from '@/shared/types'
import type { MyHomePost } from '@/shared/mocks/myHome'

/** 백엔드 CommunityPostCard → 홈 PostList 가 쓰는 MyHomePost 뷰 모델로 매핑 */
export const toMyHomePost = (post: CommunityPostCard): MyHomePost => ({
  id: post.postId,
  author: {
    userId: post.authorId,
    nickname: post.authorNickname,
    avatarUrl: post.authorProfileImageUrl ?? null,
  },
  createdAt: post.createdAt,
  description: post.bodyExcerpt,
  images: post.photoUrls,
  likeCount: post.likeCount,
  commentCount: post.commentCount,
})

import type { CommunityPostCard } from '@/shared/types'

/** PostList가 CommunityPostCard를 직접 사용하므로 기존 호출부를 위한 호환 함수. */
export const toMyHomePost = (post: CommunityPostCard): CommunityPostCard => post

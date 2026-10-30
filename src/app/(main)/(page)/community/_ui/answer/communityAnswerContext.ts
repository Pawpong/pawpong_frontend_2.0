import type { CommunityPostDetail } from '@/shared/types'
import type { AuthReadSession } from '@/shared/lib/authReadSession'

export function communityAnswerContext(
  post: CommunityPostDetail,
  isOwner: boolean,
  session: AuthReadSession | null,
) {
  return JSON.stringify([
    post.postId,
    post.body,
    post.title,
    post.experience?.topics,
    post.experience?.question,
    post.visibility,
    post.status,
    post.authorId,
    post.authorModel,
    isOwner,
    session?.scope,
  ])
}

export function canRequestCommunityAnswer(
  post: CommunityPostDetail,
  isOwner: boolean,
  session: AuthReadSession | null,
) {
  return Boolean(
    isOwner &&
    post.status === 'published' &&
    post.experience?.question &&
    session?.identity === JSON.stringify([post.authorModel.toLowerCase(), post.authorId]),
  )
}

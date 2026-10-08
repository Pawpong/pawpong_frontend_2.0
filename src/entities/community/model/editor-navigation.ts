import type { CommunityPostStatus } from '@/shared/types'
import { communityFeedHref, parseCommunityFeedNavigation } from './feed-navigation'

export function communityEditorExitHref(options: {
  postId?: string
  status?: CommunityPostStatus
  returnTo?: string
}): string {
  if (options.status === 'draft') return '/drafts'
  if (options.postId) return `/community/post/${encodeURIComponent(options.postId)}`
  const returnTo = options.returnTo ?? ''
  if (returnTo === '/community' || returnTo.startsWith('/community?'))
    return communityFeedHref(
      parseCommunityFeedNavigation(new URLSearchParams(returnTo.split('?')[1])),
    )
  return '/community'
}

export function communitySavedPostHref(status: CommunityPostStatus, postId: string): string {
  return status === 'draft' ? '/drafts' : `/community/post/${encodeURIComponent(postId)}`
}

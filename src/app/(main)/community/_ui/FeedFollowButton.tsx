'use client'

import { useFollowUser, useUnfollowUser } from '@/features/profile'
import { FollowButton } from '@/shared/ui'

interface FeedFollowButtonProps {
  userId: string
  isFollowing: boolean
  guard: (action: () => void) => () => void
}

/** 피드 카드 헤더의 작성자 팔로우 토글 — features/community 가 features/profile 을 못 가져와 앱 레이어에서 조립한다. */
const FeedFollowButton = ({ userId, isFollowing, guard }: FeedFollowButtonProps) => {
  const follow = useFollowUser()
  const unfollow = useUnfollowUser()
  const isPending = follow.isPending || unfollow.isPending

  return (
    <FollowButton
      size="sm"
      status={isFollowing ? 'following' : 'follow'}
      disabled={isPending}
      onClick={guard(() => (isFollowing ? unfollow : follow).mutate(userId))}
    />
  )
}

export { FeedFollowButton }

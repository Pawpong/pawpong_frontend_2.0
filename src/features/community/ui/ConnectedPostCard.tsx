'use client'

import type { ComponentProps } from 'react'
import { CommunityBox, PostCard } from '@/entities/community'
import {
  useToggleCommunityPostBookmark,
  useToggleCommunityPostLike,
} from '../api/communityReaction.mutations'

type InjectedActions = 'onToggleLike' | 'onToggleSave'

/** entities 카드가 표시만 하는 좋아요·북마크를 mutation에 연결한다. */
const useCardReactions = (postId: string, isLiked: boolean, isSaved: boolean) => {
  const { toggleLike } = useToggleCommunityPostLike(postId, isLiked)
  const { toggleBookmark } = useToggleCommunityPostBookmark(postId, isSaved)

  return { onToggleLike: toggleLike, onToggleSave: toggleBookmark }
}

/**
 * entities의 프레젠테이셔널 카드에 카드 액션 mutation을 연결한 features 레이어 래퍼.
 * (entities → features 역방향 import 금지이므로 연결은 이 래퍼에서 수행)
 */
const ConnectedPostCard = (props: Omit<ComponentProps<typeof PostCard>, InjectedActions>) => {
  const reactions = useCardReactions(props.postId, props.isLiked, props.isSaved)

  return <PostCard {...props} {...reactions} />
}

const ConnectedCommunityBox = (
  props: Omit<ComponentProps<typeof CommunityBox>, InjectedActions>,
) => {
  const reactions = useCardReactions(props.postId, props.isLiked, props.isSaved)

  return <CommunityBox {...props} {...reactions} />
}

export { ConnectedCommunityBox, ConnectedPostCard }

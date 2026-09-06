'use client'

import type { ComponentProps } from 'react'
import { CommunityBox, CommunityFeedCard, PostCard } from '@/entities/community'
import {
  useToggleCommunityPostBookmark,
  useToggleCommunityPostLike,
} from '../api/communityReaction.mutations'
import { ReportPostAction } from './ReportPostAction'

type InjectedActions = 'onToggleLike' | 'onToggleSave' | 'moreAction'

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

  return (
    <PostCard
      {...props}
      {...reactions}
      moreAction={props.onDelete ? undefined : <ReportPostAction postId={props.postId} />}
    />
  )
}

const ConnectedCommunityBox = (
  props: Omit<ComponentProps<typeof CommunityBox>, InjectedActions>,
) => {
  const reactions = useCardReactions(props.postId, props.isLiked, props.isSaved)

  return (
    <CommunityBox
      {...props}
      {...reactions}
      moreAction={<ReportPostAction postId={props.postId} />}
    />
  )
}

interface ConnectedFeedCardProps extends Omit<
  ComponentProps<typeof CommunityFeedCard>,
  InjectedActions
> {
  /**
   * 로그인이 필요한 동작을 감싸는 가드 (features/auth의 useLoginGuard).
   * 같은 레이어의 auth 슬라이스를 직접 참조하지 않도록 앱 레이어에서 주입받는다.
   */
  guard?: (action: () => void) => () => void
}

const ConnectedFeedCard = ({ guard, ...props }: ConnectedFeedCardProps) => {
  const reactions = useCardReactions(props.postId, props.isLiked, props.isSaved)

  return (
    <CommunityFeedCard
      {...props}
      onToggleLike={guard ? guard(reactions.onToggleLike) : reactions.onToggleLike}
      onToggleSave={guard ? guard(reactions.onToggleSave) : reactions.onToggleSave}
      moreAction={props.onDelete ? undefined : <ReportPostAction postId={props.postId} />}
    />
  )
}

export { ConnectedCommunityBox, ConnectedFeedCard, ConnectedPostCard }

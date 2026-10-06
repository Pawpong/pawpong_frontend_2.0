'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { readCommunityAutoApplied, type CommunityAutoApplied } from './communityAutoApplied'

const subscribe = () => () => {}

/** 방금 올린 내 글에 자동으로 붙은 주제·태그. 서버 렌더와 다른 탭에서는 null. */
export function useCommunityAutoApplied(
  postId: string,
  enabled: boolean,
): CommunityAutoApplied | null {
  // 객체를 그대로 돌려주면 매 렌더 새 값이 되어 문자열 스냅샷으로 비교한다.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (enabled ? JSON.stringify(readCommunityAutoApplied(postId)) : 'null'),
    () => 'null',
  )
  return useMemo(() => JSON.parse(snapshot) as CommunityAutoApplied | null, [snapshot])
}

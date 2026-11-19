'use client'

import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { useAuthStatus } from '@/shared/lib/useAuthStatus'

/**
 * 하단 탭(웹 하단바·앱 탭 바)의 채팅 배지 숫자. 로그인했을 때만 읽고, 실패해도 배지만 비운다.
 * 폴링은 항상 마운트되는 상단 NavBar 가 맡는다 — 여기서는 같은 캐시만 구독한다.
 */
export const useChatUnreadCount = () => {
  const { isLoggedIn } = useAuthStatus()
  const { data = 0 } = useQuery({
    ...chatQueries.unreadCount(),
    enabled: isLoggedIn,
    throwOnError: false,
  })
  return data
}

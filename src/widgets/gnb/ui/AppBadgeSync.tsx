'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStatus } from '@/features/auth'
import { notificationQueries } from '@/entities/notification'
import { setNativeAppBadge, subscribeNativeCapabilities } from '@/shared/lib/nativeBridge'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'

/** 앱 아이콘 숫자를 안 읽은 알림 수와 맞춘다. 로그아웃하면 지우고, 앱으로 돌아오면 다시 센다. */
const AppBadgeSync = () => {
  const { isReady } = useAuthStatus()
  const session = useAuthReadSession()
  const { data, refetch } = useQuery({
    ...notificationQueries.unreadCount(),
    enabled: isReady && Boolean(session),
    throwOnError: false,
  })
  const count = session ? (data ?? 0) : 0

  useEffect(() => {
    if (!isReady) return
    const sync = () => setNativeAppBadge(count)
    sync()
    // 앱 기능이 늦게 주입돼도 한 번 더 맞춘다.
    return subscribeNativeCapabilities(sync)
  }, [isReady, count])

  useEffect(() => {
    if (!isReady || !session) return
    const refresh = () => void refetch()
    window.addEventListener('pawpong:app-active', refresh)
    return () => window.removeEventListener('pawpong:app-active', refresh)
  }, [isReady, session, refetch])

  return null
}

export { AppBadgeSync }
